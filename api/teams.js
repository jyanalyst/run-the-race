import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "rtr2025";
const KID_AGE_CUTOFF = 12;
const TEAM_COUNT = 4;
const KID_TIME_OFFSET = 13;

function isKid(member) {
  return member.age && parseInt(member.age) <= KID_AGE_CUTOFF;
}

// Per-leg time: adults run a fast leg (1 unit), kids run slower the younger they are.
// Age 12 ≈ adult; age 4 ≈ 9 units. Used to balance total team race time.
function legTime(member) {
  if (!isKid(member)) return 1;
  return Math.max(1, KID_TIME_OFFSET - parseInt(member.age));
}

function buildBalancedTeams(allFamilies) {
  // Build family units — each unit has relay members grouped by family
  const familyUnits = allFamilies.map(f => {
    const relayMembers = (f.data.members || []).filter(m => m.relay).map(m => ({
      ...m,
      age: m.age && parseInt(m.age) > KID_AGE_CUTOFF ? "" : m.age,
      family: f.data.name,
      familyKey: f.key,
    }));
    const kids = relayMembers.filter(m => isKid(m));
    const adults = relayMembers.filter(m => !isKid(m));
    const totalKidAge = kids.reduce((s, m) => s + parseInt(m.age), 0);
    const avgKidAge = kids.length ? totalKidAge / kids.length : 0;
    const familyTime = relayMembers.reduce((s, m) => s + legTime(m), 0);
    return {
      key: f.key,
      name: f.data.name,
      members: relayMembers,
      kids,
      adults,
      kidCount: kids.length,
      adultCount: adults.length,
      totalKidAge,
      avgKidAge,
      familyTime,
    };
  }).filter(f => f.members.length > 0); // only families with relay members

  // Sort family units by total race time descending — slowest (young-kid-heavy)
  // families get assigned first so they can land on the smallest team.
  // Name tiebreaker keeps the result deterministic across "Form Teams" runs,
  // since redis.keys() returns families in an undefined order.
  familyUnits.sort((a, b) => b.familyTime - a.familyTime || a.name.localeCompare(b.name));

  // Initialise 4 empty teams
  const teams = [[], [], [], []];
  const teamStats = Array.from({ length: TEAM_COUNT }, () => ({
    kidCount: 0, adultCount: 0, totalKidAge: 0, memberCount: 0, totalTime: 0
  }));

  // Greedy fill — each family goes to the team with the lowest current race time.
  // This naturally puts slower (young-kid-heavy) families on smaller teams and
  // faster (adult-heavy) families on larger teams, equalising race times across teams.
  familyUnits.forEach(unit => {
    let teamIndex = 0;
    let minTime = Infinity;
    for (let i = 0; i < TEAM_COUNT; i++) {
      if (teamStats[i].totalTime < minTime) {
        minTime = teamStats[i].totalTime;
        teamIndex = i;
      }
    }

    unit.members.forEach(m => teams[teamIndex].push(m));

    teamStats[teamIndex].kidCount += unit.kidCount;
    teamStats[teamIndex].adultCount += unit.adultCount;
    teamStats[teamIndex].totalKidAge += unit.totalKidAge;
    teamStats[teamIndex].memberCount += unit.members.length;
    teamStats[teamIndex].totalTime += unit.familyTime;
  });

  return { teams, teamStats };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // GET — return current teams
    if (req.method === "GET") {
      const raw = await redis.get("teams");
      const teams = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : [[], [], [], []];
      return res.status(200).json({ teams });
    }

    // POST — admin triggers team formation
    if (req.method === "POST") {
      const password = req.headers["x-admin-password"];
      if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorised" });

      // Get all families
      const keys = await redis.keys("family:*");
      if (!keys.length) return res.status(400).json({ error: "No families registered" });

      const raw = await Promise.all(keys.map(k => redis.get(k)));
      const families = raw
        .map((r, i) => ({ key: keys[i], data: r ? (typeof r === "string" ? JSON.parse(r) : r) : null }))
        .filter(f => f.data);

      // Build balanced teams — families always stay together
      const { teams } = buildBalancedTeams(families);

      // Save teams
      await redis.set("teams", JSON.stringify(teams));

      // Update each family record with their teamIndex
      for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
        const familyKeys = [...new Set(teams[teamIndex].map(m => m.familyKey))];
        for (const fKey of familyKeys) {
          const fRaw = await redis.get(fKey);
          if (fRaw) {
            const family = typeof fRaw === "string" ? JSON.parse(fRaw) : fRaw;
            family.teamIndex = teamIndex;
            await redis.set(fKey, JSON.stringify(family));
          }
        }
      }

      return res.status(200).json({ teams, success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
