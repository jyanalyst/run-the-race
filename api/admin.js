import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "rtr2025";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");
  if (req.method === "OPTIONS") return res.status(200).end();

  const password = req.headers["x-admin-password"];
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorised" });
  }

  try {
    // GET — list all families
    if (req.method === "GET") {
      const keys = await redis.keys("family:*");
      if (!keys.length) return res.status(200).json({ families: [] });

      const raw = await Promise.all(keys.map(k => redis.get(k)));
      const families = raw
        .map((r, i) => ({ key: keys[i], data: r ? (typeof r === "string" ? JSON.parse(r) : r) : null }))
        .filter(f => f.data)
        .sort((a, b) => a.data.registeredAt - b.data.registeredAt);

      return res.status(200).json({ families });
    }

    // POST — admin edits to a family record (currently only member removal)
    if (req.method === "POST") {
      const { key, action, memberIndex } = req.body;
      if (!key) return res.status(400).json({ error: "Key required" });

      if (action === "removeMember") {
        const raw = await redis.get(key);
        if (!raw) return res.status(404).json({ error: "Family not found" });
        const family = typeof raw === "string" ? JSON.parse(raw) : raw;
        const members = family.members || [];
        if (typeof memberIndex !== "number" || memberIndex < 0 || memberIndex >= members.length) {
          return res.status(400).json({ error: "Invalid memberIndex" });
        }
        members.splice(memberIndex, 1);
        family.members = members;
        await redis.set(key, JSON.stringify(family));
        return res.status(200).json({ family });
      }

      return res.status(400).json({ error: "Unknown action" });
    }

    // DELETE — remove a family by key
    if (req.method === "DELETE") {
      const { key } = req.body;
      if (!key) return res.status(400).json({ error: "Key required" });
      await redis.del(key);
      return res.status(200).json({ deleted: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
