import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/manifest.webmanifest")({
  server: {
    handlers: {
      GET: async () => {
        const body = {
          name: "The Hat League",
          short_name: "THL",
          description:
            "A draft-style Rocket League tournament series. Sign up, get drafted live on Twitch, bring your hat.",
          start_url: "/",
          display: "standalone",
          background_color: "#0a0a0a",
          theme_color: "#f76103",
          icons: [
            {
              src: "/brand/thl-logo.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/brand/thl-logo.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        };
        return new Response(JSON.stringify(body), {
          headers: {
            "content-type": "application/manifest+json; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
