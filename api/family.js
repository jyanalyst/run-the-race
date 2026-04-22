import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { method } = req;

  try {
    // GET /api/family?name=xxx — get or register family
    if (method === "GET") {
      const { name } = req.query;
      if (!name) return res.status(400).json({ error: "Name required" });

      const key = `family:${name.toLowerCase().replace(/\s+/g, "-")}`;
      const existing = await kv.get(key);
      if (existing) return res.status(200).json({ family: existing, isNew: false });

      // Count families to assign starting station
      const keys = await kv.keys("family:*");
      const count = keys.length;
      const STATIONS = 4;
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
        registeredAt: Date.now(),
      };

      await kv.set(key, family);
      return res.status(200).json({ family, isNew: true });
    }

    // POST /api/family — update family progress
    if (method === "POST") {
      const { name, updates } = req.body;
      if (!name || !updates) return res.status(400).json({ error: "Name and updates required" });

      const key = `family:${name.toLowerCase().replace(/\s+/g, "-")}`;
      const existing = await kv.get(key);
      if (!existing) return res.status(404).json({ error: "Family not found" });

      const updated = { ...existing, ...updates };
      await kv.set(key, updated);
      return res.status(200).json({ family: updated });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
