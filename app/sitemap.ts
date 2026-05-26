import type { MetadataRoute } from "next";

const BASE = "https://thehatleague.com";

const PUBLIC_PAGES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "/the-draft", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/pool", changeFrequency: "daily" as const, priority: 0.8 },
  { path: "/captains", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/schedule", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/standings", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/leaderboards", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/replays", changeFrequency: "weekly" as const, priority: 0.5 },
  { path: "/rules", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/announcements", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/signin", changeFrequency: "yearly" as const, priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  return PUBLIC_PAGES.map((p) => ({
    url: `${BASE}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
