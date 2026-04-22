import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const keys = await kv.keys("family:*");
    if (!keys.length) return res.status(200).json({ leaderboard: [] });

    const families = await Promise.all(keys.map(k => kv.get(k)));
    const sorted = families
      .filter(Boolean)
      .sort((a, b) => b.stationsComplete - a.stationsComplete || a.registeredAt - b.registeredAt);

    return res.status(200).json({ leaderboard: sorted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
