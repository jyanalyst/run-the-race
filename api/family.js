import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const STATIONS = 4;

function balanceTeams(existingTeams, relayMembers) {
  const scores = existingTeams.map((team, i) => {
    const kids = team.filter(m => m.age && parseInt(m.age) < 18);
    const adults = team.filter(m => !m.age || parseInt(m.age) >= 18);
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
      const { name } = req.query;
      if (!name) return res.status(400).json({ error: "Name required" });

      const key = `family:${name.toLowerCase().replace(/\s+/g, "-")}`;
      const existing = await redis.get(key);
      if (existing) {
        const family = typeof existing === "string" ? JSON.parse(existing) : existing;
        return res.status(200).json({ family, isNew: false });
      }

      const keys = await redis.keys("family:*");
      const count = keys.length;
      const startStation = (count % STATIONS) + 1;
      const stationOrder = [];
      for (let i = 0; i < STATIONS; i++) {
        stationOrder.push(((startStation - 1 + i) % STATIONS) + 1);
      }

      const family = {
        name: name.trim(),
        startStation,
        stationOrder,
        currentIndex: 0,
        stationsComplete: 0,
        completedStations: [],
        members: [],
        registeredAt: Date.now(),
      };

      await redis.set(key, JSON.stringify(family));
      return res.status(200).json({ family, isNew: true });
    }

    if (req.method === "POST") {
      const { name, updates } = req.body;
      if (!name || !updates) return res.status(400).json({ error: "Name and updates required" });

      const key = `family:${name.toLowerCase().replace(/\s+/g, "-")}`;
      const raw = await redis.get(key);
      if (!raw) return res.status(404).json({ error: "Family not found" });

      const existing = typeof raw === "string" ? JSON.parse(raw) : raw;
      const updated = { ...existing, ...updates };

      // If family just completed all stations — assign to team directly here
      const justCompleted = updates.stationsComplete >= STATIONS && (existing.stationsComplete || 0) < STATIONS;
      
      if (justCompleted && updated.teamIndex === undefined) {
        // Get current teams
        const teamsRaw = await redis.get("teams");
        const teams = teamsRaw
          ? (typeof teamsRaw === "string" ? JSON.parse(teamsRaw) : teamsRaw)
          : [[], [], [], []];

        // Get relay members
        const relayMembers = (updated.members || []).filter(m => m.relay);

        if (relayMembers.length > 0) {
          const teamIndex = balanceTeams(teams, relayMembers);
          
          // Add members to team
          relayMembers.forEach(m => {
            teams[teamIndex].push({ ...m, family: name });
          });

          await redis.set("teams", JSON.stringify(teams));
          updated.teamIndex = teamIndex;
        } else {
          // No relay members — assign to smallest team by default
          const scores = [0,1,2,3].map(i => ({ index: i, count: (teams[i] || []).length }));
          scores.sort((a, b) => a.count - b.count);
          updated.teamIndex = scores[0].index;
        }
      }

      await redis.set(key, JSON.stringify(updated));
      return res.status(200).json({ family: updated });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
