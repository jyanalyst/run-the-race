import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const STATIONS = 4;

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
      await redis.set(key, JSON.stringify(updated));

      // If family just completed all stations — assign to a team
      if (updates.stationsComplete >= STATIONS && existing.stationsComplete < STATIONS) {
        try {
          await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/teams`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ familyName: name, members: updated.members || [] }),
          });
          // Re-fetch updated family with teamIndex
          const refreshed = await redis.get(key);
          const refreshedFamily = typeof refreshed === "string" ? JSON.parse(refreshed) : refreshed;
          return res.status(200).json({ family: refreshedFamily });
        } catch (e) {
          console.error("Team assignment failed", e);
        }
      }

      return res.status(200).json({ family: updated });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
