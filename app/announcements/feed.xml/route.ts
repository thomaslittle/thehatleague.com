import { getRecentAnnouncements } from "@/lib/data/announcements";
import { env } from "@/lib/env";

const FEED_LIMIT = 30;

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const items = await getRecentAnnouncements(FEED_LIMIT);
  const base = env.SITE_URL.replace(/\/$/, "");
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
      "Content-Type": "application/atom+xml; charset=utf-8",
      // Stream-cache for 5 minutes; the admin's revalidatePath() warms it
      // immediately after a publish.
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
