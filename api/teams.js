import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KID_AGE_CUTOFF = 12;

function isKid(member) {
  return member.age && parseInt(member.age) <= KID_AGE_CUTOFF;
}

function balanceTeams(existingTeams, relayMembers) {
  const scores = existingTeams.map((team, i) => {
    const kids = team.filter(m => isKid(m));
    const adults = team.filter(m => !isKid(m));
    const totalAge = kids.reduce((s, m) => s + parseInt(m.age), 0);
    return { index: i, kidCount: kids.length, adultCount: adults.length, totalAge };
  });
  scores.sort((a, b) => a.kidCount - b.kidCount || a.adultCount - b.adultCount || a.totalAge - b.totalAge);
  return scores[0].index;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET") {
      const raw = await redis.get("teams");
      const teams = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : [[], [], [], []];
      return res.status(200).json({ teams });
    }

    if (req.method === "POST") {
      const { familyName, members } = req.body;
      if (!familyName || !members) return res.status(400).json({ error: "Missing data" });

      const raw = await redis.get("teams");
      const teams = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : [[], [], [], []];

      const relayMembers = members.filter(m => m.relay);
      if (!relayMembers.length) return res.status(200).json({ teams, teamIndex: 0 });

      const teamIndex = balanceTeams(teams, relayMembers);

      relayMembers.forEach(m => {
        const normalised = { ...m };
        if (normalised.age && parseInt(normalised.age) > KID_AGE_CUTOFF) {
          normalised.age = "";
        }
        teams[teamIndex].push({ ...normalised, family: familyName });
      });

      await redis.set("teams", JSON.stringify(teams));

      const familyKey = `family:${familyName.toLowerCase().replace(/\s+/g, "-")}`;
      const familyRaw = await redis.get(familyKey);
      if (familyRaw) {
        const family = typeof familyRaw === "string" ? JSON.parse(familyRaw) : familyRaw;
        family.teamIndex = teamIndex;
        await redis.set(familyKey, JSON.stringify(family));
      }

      return res.status(200).json({ teams, teamIndex });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
