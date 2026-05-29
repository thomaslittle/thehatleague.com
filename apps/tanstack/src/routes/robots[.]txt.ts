import { createFileRoute } from "@tanstack/react-router";

const BASE = "https://thehatleague.com";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const body = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /onboarding
Disallow: /settings
Disallow: /auth/callback
Disallow: /admin
Disallow: /api/

Sitemap: ${BASE}/sitemap.xml
`;
        return new Response(body, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
