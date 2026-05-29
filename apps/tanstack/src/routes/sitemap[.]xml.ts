import { createFileRoute } from "@tanstack/react-router";
import { getRecentAnnouncements } from "@/server/announcements";
import { getFullPool } from "@/server/pool";

const BASE = "https://thehatleague.com";

const PAGES: {
  path: string;
  changeFreq: "weekly" | "daily" | "monthly" | "yearly";
  priority: number;
}[] = [
  { path: "/", changeFreq: "weekly", priority: 1.0 },
  { path: "/the-draft", changeFreq: "weekly", priority: 0.9 },
  { path: "/pool", changeFreq: "daily", priority: 0.8 },
  { path: "/captains", changeFreq: "weekly", priority: 0.7 },
  { path: "/schedule", changeFreq: "weekly", priority: 0.7 },
  { path: "/standings", changeFreq: "weekly", priority: 0.7 },
  { path: "/leaderboards", changeFreq: "weekly", priority: 0.7 },
  { path: "/announcements", changeFreq: "weekly", priority: 0.7 },
  { path: "/clips", changeFreq: "weekly", priority: 0.6 },
  { path: "/replays", changeFreq: "weekly", priority: 0.5 },
  { path: "/mvp", changeFreq: "monthly", priority: 0.5 },
  { path: "/rules", changeFreq: "monthly", priority: 0.6 },
  { path: "/about", changeFreq: "monthly", priority: 0.5 },
  { path: "/signin", changeFreq: "yearly", priority: 0.4 },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const now = new Date().toISOString();
        const staticUrls = PAGES.map(
          (p) => `  <url>
    <loc>${BASE}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changeFreq}</changefreq>
    <priority>${p.priority.toFixed(1)}</priority>
  </url>`,
        );

        // Append dynamic detail pages so crawlers can index individual
        // announcements and player profiles. Falls back to just the static
        // list if either fetch fails — sitemap should never 500.
        let dynamicUrls: string[] = [];
        try {
          const [announcements, players] = await Promise.all([
            getRecentAnnouncements({ data: { limit: 200 } }),
            getFullPool(),
          ]);
          dynamicUrls = [
            ...announcements.map(
              (a) => `  <url>
    <loc>${BASE}/announcements/${a.slug}</loc>
    <lastmod>${a.published_at ?? a.updated_at ?? now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`,
            ),
            ...players
              .filter((p) => p.discord_username)
              .map(
                (p) => `  <url>
    <loc>${BASE}/players/${encodeURIComponent(p.discord_username!)}</loc>
    <lastmod>${p.created_at ?? now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.4</priority>
  </url>`,
              ),
          ];
        } catch {
          // swallow — static list still serves
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...dynamicUrls].join("\n")}
</urlset>`;
        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
