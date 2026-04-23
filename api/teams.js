import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "rtr2025";
const KID_AGE_CUTOFF = 12;
const TEAM_COUNT = 4;

function isKid(member) {
  return member.age && parseInt(member.age) <= KID_AGE_CUTOFF;
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
    };
  }).filter(f => f.members.length > 0); // only families with relay members

  // Sort family units by combined strength score descending
  // Score = avgKidAge * 2 + adultCount * 5
  // Adults weighted more heavily since they run faster and have bigger impact on relay
  familyUnits.sort((a, b) => {
    const scoreA = (a.avgKidAge * 2) + (a.adultCount * 5);
    const scoreB = (b.avgKidAge * 2) + (b.adultCount * 5);
    return scoreB - scoreA;
  });

  // Initialise 4 empty teams
  const teams = [[], [], [], []];
  const teamStats = Array.from({ length: TEAM_COUNT }, () => ({
    kidCount: 0, adultCount: 0, totalKidAge: 0, score: 0
  }));

  // Snake draft family units by combined strength score
  // Even rounds: 0→3, Odd rounds: 3→0
  familyUnits.forEach((unit, i) => {
    const round = Math.floor(i / TEAM_COUNT);
    const pos = i % TEAM_COUNT;
    const teamIndex = round % 2 === 0 ? pos : TEAM_COUNT - 1 - pos;

    // Add all family members to the same team
    unit.members.forEach(m => {
      teams[teamIndex].push(m);
    });

    // Update team stats
    const unitScore = (unit.avgKidAge * 2) + (unit.adultCount * 5);
    teamStats[teamIndex].kidCount += unit.kidCount;
    teamStats[teamIndex].adultCount += unit.adultCount;
    teamStats[teamIndex].totalKidAge += unit.totalKidAge;
    teamStats[teamIndex].score += unitScore;
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
