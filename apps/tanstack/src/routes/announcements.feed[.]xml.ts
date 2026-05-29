import { createFileRoute } from "@tanstack/react-router";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const FEED_LIMIT = 30;

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function siteOriginFromRequest(): string {
  const forwardedHost = getRequestHeader("x-forwarded-host");
  const forwardedProto = getRequestHeader("x-forwarded-proto") ?? "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  const host = getRequestHeader("host") ?? "localhost:3001";
  return `${forwardedProto}://${host}`;
}

export const Route = createFileRoute("/announcements/feed.xml")({
  server: {
    handlers: {
      GET: async () => {
        const supabase = createSupabaseServerClient();
        const { data: rows } = await supabase
          .from("announcements")
          .select("*")
          .not("published_at", "is", null)
          .order("pinned", { ascending: false })
          .order("published_at", { ascending: false })
          .limit(FEED_LIMIT);
        const items = rows ?? [];
        const base = siteOriginFromRequest().replace(/\/$/, "");
        const updated =
          items[0]?.published_at ?? new Date().toISOString();

        const entries = items
          .map((a) => {
            const url = `${base}/announcements/${a.slug}`;
            const published = a.published_at ?? a.created_at;
            return `
  <entry>
    <id>${url}</id>
    <link rel="alternate" type="text/html" href="${url}" />
    <title>${escapeXml(a.title)}</title>
    <updated>${new Date(a.updated_at).toISOString()}</updated>
    <published>${new Date(published).toISOString()}</published>
    <summary type="text">${escapeXml(a.body.slice(0, 280))}</summary>
    <content type="text">${escapeXml(a.body)}</content>
  </entry>`;
          })
          .join("");

        const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>The Hat League · Announcements</title>
  <subtitle>Draft updates, schedule changes, rule tweaks.</subtitle>
  <link rel="self" href="${base}/announcements/feed.xml" />
  <link rel="alternate" type="text/html" href="${base}/announcements" />
  <id>${base}/announcements/feed.xml</id>
  <updated>${new Date(updated).toISOString()}</updated>
  <generator uri="${base}">thehatleague.com</generator>${entries}
</feed>`;

        return new Response(xml, {
          headers: {
            "content-type": "application/atom+xml; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
