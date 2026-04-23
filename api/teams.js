import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const STATIONS = 4;
const TEAM_NAMES = ["Eagles", "Lions", "Bears", "Hawks"];

function balanceTeams(existingTeams, newRelayMembers) {
  // Score each team by kid count and adult count
  const scores = existingTeams.map((team, i) => {
    const kids = team.filter(m => m.age && parseInt(m.age) < 18);
    const adults = team.filter(m => !m.age || parseInt(m.age) >= 18);
    const totalAge = kids.reduce((s, m) => s + parseInt(m.age), 0);
    return { index: i, kidCount: kids.length, adultCount: adults.length, totalAge };
  });

  // Sort by kid count first, then adult count, then total age (lower = younger team, needs older kids)
  scores.sort((a, b) => a.kidCount - b.kidCount || a.adultCount - b.adultCount || a.totalAge - b.totalAge);
  return scores[0].index;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // GET — return current teams
    if (req.method === "GET") {
      const raw = await redis.get("teams");
      const teams = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : [[], [], [], []];
      return res.status(200).json({ teams });
    }

    // POST — assign family to a team after completing all stations
    if (req.method === "POST") {
      const { familyName, members } = req.body;
      if (!familyName || !members) return res.status(400).json({ error: "Missing data" });

      // Get current teams
      const raw = await redis.get("teams");
      const teams = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : [[], [], [], []];

      // Only relay members get added to teams
      const relayMembers = members.filter(m => m.relay);
      if (!relayMembers.length) return res.status(200).json({ teams, teamIndex: 0 });

      // Find best team
      const teamIndex = balanceTeams(teams, relayMembers);

      // Add members to team with family tag
      relayMembers.forEach(m => {
        teams[teamIndex].push({ ...m, family: familyName });
      });

      await redis.set("teams", JSON.stringify(teams));

      // Update family record with team assignment
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
