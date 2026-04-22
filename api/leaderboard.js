import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const keys = await redis.keys("family:*");
    if (!keys.length) return res.status(200).json({ leaderboard: [] });

    const raw = await Promise.all(keys.map(k => redis.get(k)));
    const families = raw
      .map(r => (r ? (typeof r === "string" ? JSON.parse(r) : r) : null))
      .filter(Boolean)
      .sort((a, b) => b.stationsComplete - a.stationsComplete || a.registeredAt - b.registeredAt);

    return res.status(200).json({ leaderboard: families });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
