// Server-side adapter for pulling clips from the Discord
// #clips-and-highlights channel.
//
// Required env vars (set in .env.local locally + Coolify in prod):
//   DISCORD_BOT_TOKEN          — the bot user's token
//   DISCORD_GUILD_ID           — server ID (used to build the "view in
//                                Discord" deep-link only)
//   DISCORD_CLIPS_CHANNEL_ID   — the clips-and-highlights channel ID
//
// With any of those missing this falls back to an empty list and the
// landing-page Clips section renders its polished placeholder.

import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTwitchAccessToken, getTwitchClientId } from "@/lib/twitch/auth";
import { cleanDiscordUsername } from "@/lib/discord/name";

export type ClipSource =
  | "discord-mp4"
  | "discord-image"
  | "gifyourgame"
  | "medal"
  | "twitch-clip"
  | "youtube"
  | "imgur"
  | "x"
  | "other";

export interface ClipSubmitterProfile {
  username: string;
  isCaptain: boolean;
}

export interface Clip {
  id: string;
  /** Caption-style headline (the message text, an embed title, or a
   *  host label). */
  title: string;
  /** Classification so the UI can pick the right embed strategy. */
  source: ClipSource;
  /** ISO timestamp of the original Discord message. */
  postedAt: string;
  /** External link target ("View on …" / Discord permalink). */
  url: string;
  /** Direct mp4 URL when Discord hosted the file. */
  videoUrl?: string;
  /** Iframe-ready embed URL (YouTube nocookie, medal/embed, twitch/embed…). */
  embedUrl?: string;
  /** Static thumbnail to render in the card. */
  thumbUrl?: string;
  /** Discord user ID of the poster. */
  submitterDiscordId: string;
  /** Display name (global name when set, else username) for the card. */
  submitterName: string;
  /** Avatar URL from Discord CDN (cdn.discordapp.com). */
  submitterAvatarUrl: string | null;
  /** Site profile match if the poster has signed up. null otherwise. */
  submitterProfile: ClipSubmitterProfile | null;
  /** Parsed "Wk N" tag if the poster typed one, else month label w/ year. */
  week: string;
  /** Total reaction count across all emojis on the message. */
  likes: number;
  /** Direct count of 👍 (thumbsup) reactions — used so we can render the
   *  league's own like count separate from random reactions. */
  thumbsUp: number;
  /** Mostly unused right now — Discord doesn't expose video duration via
   *  the REST channel-messages endpoint. */
  duration?: string;
}

interface DiscordAttachment {
  id: string;
  url: string;
  proxy_url: string;
  content_type?: string;
  filename: string;
  width?: number;
  height?: number;
}

interface DiscordEmbedThumb {
  url: string;
  proxy_url?: string;
  width?: number;
  height?: number;
}

interface DiscordEmbed {
  type?: string;
  url?: string;
  title?: string;
  thumbnail?: DiscordEmbedThumb;
  image?: DiscordEmbedThumb;
  video?: { url?: string; width?: number; height?: number };
  provider?: { name?: string; url?: string };
}

interface DiscordAuthor {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  discriminator?: string;
}

interface DiscordReaction {
  emoji: { name?: string | null; id?: string | null };
  count: number;
}

interface DiscordMessage {
  id: string;
  channel_id: string;
  author: DiscordAuthor;
  content: string;
  timestamp: string;
  attachments?: DiscordAttachment[];
  embeds?: DiscordEmbed[];
  reactions?: DiscordReaction[];
  pinned?: boolean;
}

const DISCORD_API = "https://discord.com/api/v10";

const CLIP_HOSTS_RE =
  /https?:\/\/[^\s]*(?:gifyourgame\.com|medal\.tv|streamable\.com|clips\.twitch\.tv|twitch\.tv\/[^\s]+\/clip|youtube\.com|youtu\.be|imgur\.com|x\.com|twitter\.com)\/[^\s]+/i;

export async function getClips(): Promise<Clip[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CLIPS_CHANNEL_ID;
  const guildId = process.env.DISCORD_GUILD_ID ?? "@me";
  if (!token || !channelId) return [];

  const res = await fetch(
    `${DISCORD_API}/channels/${channelId}/messages?limit=30`,
    {
      headers: {
        Authorization: `Bot ${token}`,
        "User-Agent": "TheHatLeague (https://thehatleague.com, 0.1.0)",
      },
      next: { revalidate: 60 * 5, tags: ["discord:clips"] },
    },
  ).catch((err) => {
    console.error("Discord clips fetch failed (network):", err);
    return null;
  });

  if (!res || !res.ok) {
    if (res) {
      console.error("Discord clips fetch failed:", res.status, res.statusText);
    }
    return [];
  }

  const messages = (await res.json().catch(() => null)) as
    | DiscordMessage[]
    | null;
  if (!messages) return [];

  const basic = messages
    .map((m) => messageToClip(m, guildId))
    .filter((c): c is Clip => c !== null);

  if (basic.length === 0) return [];

  // Enrich with profile matches + thumbnail metadata in parallel.
  const [enriched] = await Promise.all([enrichClips(basic)]);
  return enriched;
}

// ---------------------------------------------------------------------------
// Message → Clip
// ---------------------------------------------------------------------------

function messageToClip(m: DiscordMessage, guildId: string): Clip | null {
  const videoAttachment = m.attachments?.find((a) =>
    (a.content_type ?? "").startsWith("video/"),
  );
  const imageAttachment = m.attachments?.find((a) =>
    (a.content_type ?? "").startsWith("image/"),
  );
  const videoEmbed = m.embeds?.find(
    (e) => e.type === "video" || e.video || e.thumbnail,
  );
  const contentClipUrl = findClipUrlInContent(m.content);

  if (
    !videoAttachment &&
    !imageAttachment &&
    !videoEmbed &&
    !contentClipUrl
  ) {
    return null;
  }

  // Classify the source.
  let source: ClipSource = "other";
  let embedUrl: string | undefined;
  const messageLink = `https://discord.com/channels/${guildId}/${m.channel_id}/${m.id}`;
  let url = messageLink;

  if (videoAttachment) {
    source = "discord-mp4";
    url = videoAttachment.url;
  } else if (imageAttachment) {
    source = "discord-image";
    url = imageAttachment.url;
  } else if (contentClipUrl) {
    const classified = classifyContentUrl(contentClipUrl);
    source = classified.source;
    url = contentClipUrl;
    embedUrl = classified.embedUrl;
  } else if (videoEmbed?.url) {
    const classified = classifyContentUrl(videoEmbed.url);
    source = classified.source;
    url = videoEmbed.url;
    embedUrl = classified.embedUrl;
  }

  // Initial thumbnail guess from whatever Discord gave us. We'll override
  // for hosts where we can do better in enrichClips().
  const thumbUrl =
    videoEmbed?.thumbnail?.url ??
    videoEmbed?.image?.url ??
    imageAttachment?.proxy_url ??
    imageAttachment?.url ??
    deriveYouTubeThumb(videoEmbed?.url ?? contentClipUrl);

  const author = m.author;
  const submitterName = author.global_name ?? author.username;
  const submitterAvatarUrl = discordAvatarUrl(author);
  const likes = (m.reactions ?? []).reduce((sum, r) => sum + r.count, 0);
  const thumbsUp = (m.reactions ?? [])
    .filter((r) => r.emoji?.name === "👍")
    .reduce((sum, r) => sum + r.count, 0);

  const captionText = m.content?.trim() ?? "";
  const captionIsJustUrl = /^https?:\/\/\S+\s*$/.test(captionText);
  const titleCandidate =
    !captionIsJustUrl && captionText
      ? captionText
      : (videoEmbed?.title ?? hostLabelForSource(source) ?? "Hat clip");

  const week = parseWeekTag(m.content) ?? dateLabelFromTimestamp(m.timestamp);

  return {
    id: m.id,
    title: trimTitle(titleCandidate),
    source,
    postedAt: m.timestamp,
    url,
    videoUrl: videoAttachment?.url,
    embedUrl,
    thumbUrl,
    submitterDiscordId: author.id,
    submitterName,
    submitterAvatarUrl,
    submitterProfile: null,
    week,
    likes,
    thumbsUp,
    duration: undefined,
  };
}

// ---------------------------------------------------------------------------
// Enrichment: profile matches + better thumbnails
// ---------------------------------------------------------------------------

async function enrichClips(clips: Clip[]): Promise<Clip[]> {
  const [profileMap, thumbs, resolvedEmbeds] = await Promise.all([
    resolveProfiles(clips.map((c) => c.submitterDiscordId)),
    Promise.all(
      clips.map((c) =>
        c.thumbUrl ? Promise.resolve(c.thumbUrl) : resolveThumb(c),
      ),
    ),
    Promise.all(clips.map((c) => resolveEmbedUrl(c))),
  ]);

  return clips.map((c, i) => {
    const resolved = resolvedEmbeds[i];
    // For GIF Your Game clips, if we resolved a direct video URL, use it
    // as videoUrl (which renders as a <video> element).
    // For other sources, keep embedUrl as-is.
    if (c.source === "gifyourgame" && resolved && resolved.isVideoUrl) {
      return {
        ...c,
        submitterProfile: profileMap.get(c.submitterDiscordId) ?? null,
        thumbUrl: thumbs[i] ?? c.thumbUrl,
        videoUrl: resolved.url,
        embedUrl: undefined,
      };
    }

    return {
      ...c,
      submitterProfile: profileMap.get(c.submitterDiscordId) ?? null,
      thumbUrl: thumbs[i] ?? c.thumbUrl,
      embedUrl: resolved?.url ?? c.embedUrl,
    };
  });
}

async function resolveProfiles(
  discordIds: string[],
): Promise<Map<string, ClipSubmitterProfile>> {
  const ids = Array.from(new Set(discordIds)).filter(Boolean);
  if (ids.length === 0) return new Map();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("discord_id, discord_username, is_captain")
    .in("discord_id", ids);
  if (error || !data) return new Map();

  const map = new Map<string, ClipSubmitterProfile>();
  for (const row of data) {
    if (!row.discord_id) continue;
    const username = cleanDiscordUsername(row.discord_username);
    if (!username) continue;
    map.set(row.discord_id, {
      username,
      isCaptain: !!row.is_captain,
    });
  }
  return map;
}

async function resolveThumb(c: Clip): Promise<string | undefined> {
  switch (c.source) {
    case "twitch-clip":
      return getTwitchClipThumb(c.url);
    case "gifyourgame":
    case "medal":
    case "imgur":
      return scrapeOgImage(c.url);
    case "youtube":
      return deriveYouTubeThumb(c.url);
    default:
      return undefined;
  }
}

async function resolveEmbedUrl(
  c: Clip,
): Promise<{ url: string; isVideoUrl: boolean } | undefined> {
  // For GIF Your Game, fetch the page server-side to extract the video URL
  // instead of relying on their embed endpoint (which requires authentication).
  if (c.source === "gifyourgame" && c.embedUrl) {
    const videoUrl = await resolveGifYourGameEmbed(c.url);
    if (videoUrl) {
      return { url: videoUrl, isVideoUrl: true };
    }
  }
  // For other sources, return the original embedUrl (for iframe embedding)
  if (c.embedUrl) {
    return { url: c.embedUrl, isVideoUrl: false };
  }
  return undefined;
}

async function resolveGifYourGameEmbed(
  url: string,
): Promise<string | undefined> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TheHatLeague-Embedder/0.1" },
      next: { revalidate: 60 * 60 }, // Cache for 1 hour
    }).catch(() => null);

    if (!res || !res.ok) return undefined;

    const html = await res.text();

    // GIF Your Game embeds the video URL in the page. Look for common patterns:
    // 1. In a data attribute or script tag with the actual video URL
    // 2. Look for .mp4 or .webm URLs in the HTML
    const videoMatch = html.match(
      /(?:src|data-src|url)\s*[=:]\s*['"](https?:\/\/[^'"]*\.(?:mp4|webm|m3u8))['"]/i,
    );

    if (videoMatch?.[1]) {
      return videoMatch[1];
    }

    // Fallback: if we found a video URL, use it; otherwise fall back to embed
    return undefined;
  } catch {
    return undefined;
  }
}

async function getTwitchClipThumb(url: string): Promise<string | undefined> {
  const slug = twitchSlugFromUrl(url);
  if (!slug) return undefined;
  const token = await getTwitchAccessToken();
  const clientId = getTwitchClientId();
  if (!token || !clientId) return undefined;
  const res = await fetch(
    `https://api.twitch.tv/helix/clips?id=${encodeURIComponent(slug)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": clientId,
      },
      next: { revalidate: 60 * 30 },
    },
  ).catch(() => null);
  if (!res || !res.ok) return undefined;
  const json = (await res.json().catch(() => null)) as
    | { data: Array<{ thumbnail_url: string }> }
    | null;
  return json?.data?.[0]?.thumbnail_url;
}

async function scrapeOgImage(url: string): Promise<string | undefined> {
  const res = await fetch(url, {
    headers: { "User-Agent": "TheHatLeague-OGScraper/0.1" },
    next: { revalidate: 60 * 30 },
  }).catch(() => null);
  if (!res || !res.ok) return undefined;
  // Only sniff the head — clip-host pages render their og tags early.
  const html = (await res.text().catch(() => "")).slice(0, 32_000);
  const match =
    html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    ) ??
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    );
  return match?.[1];
}

// ---------------------------------------------------------------------------
// URL classification / helpers
// ---------------------------------------------------------------------------

function classifyContentUrl(url: string): {
  source: ClipSource;
  embedUrl?: string;
} {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host.endsWith("gifyourgame.com")) {
      const slug = u.pathname.split("/").filter(Boolean)[0];
      return {
        source: "gifyourgame",
        embedUrl: slug
          ? `https://gifyourgame.com/embed/${slug}`
          : undefined,
      };
    }

    if (host.endsWith("medal.tv")) {
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("clips");
      const slug = idx >= 0 ? parts[idx + 1] : null;
      return {
        source: "medal",
        embedUrl: slug
          ? `https://medal.tv/clips/${slug}/embed?autoplay=1`
          : undefined,
      };
    }

    if (host === "clips.twitch.tv") {
      const slug = u.pathname.split("/").filter(Boolean)[0];
      return {
        source: "twitch-clip",
        embedUrl: slug
          ? buildTwitchEmbedUrl(slug)
          : undefined,
      };
    }
    if (host.endsWith("twitch.tv") && u.pathname.includes("/clip/")) {
      const slug = u.pathname.split("/clip/")[1]?.split(/[/?#]/)[0];
      return {
        source: "twitch-clip",
        embedUrl: slug ? buildTwitchEmbedUrl(slug) : undefined,
      };
    }

    if (host.endsWith("youtu.be") || host.endsWith("youtube.com")) {
      const id = youTubeId(url);
      return {
        source: "youtube",
        embedUrl: id
          ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
          : undefined,
      };
    }

    if (host.endsWith("imgur.com")) {
      // Imgur images/videos embed as raw URL with type — we just link out.
      return { source: "imgur" };
    }

    if (host.endsWith("x.com") || host.endsWith("twitter.com")) {
      return { source: "x" };
    }

    return { source: "other" };
  } catch {
    return { source: "other" };
  }
}

function buildTwitchEmbedUrl(slug: string): string {
  // Twitch requires every parent the embed will load under. List the
  // production host plus localhost for dev/Vercel previews.
  const params = new URLSearchParams({
    clip: slug,
    autoplay: "true",
    muted: "false",
  });
  params.append("parent", "thehatleague.com");
  params.append("parent", "www.thehatleague.com");
  params.append("parent", "localhost");
  return `https://clips.twitch.tv/embed?${params.toString()}`;
}

function twitchSlugFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "clips.twitch.tv") {
      return u.pathname.split("/").filter(Boolean)[0] ?? null;
    }
    if (u.hostname.endsWith("twitch.tv") && u.pathname.includes("/clip/")) {
      return u.pathname.split("/clip/")[1]?.split(/[/?#]/)[0] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

function youTubeId(url: string): string | undefined {
  const m =
    url.match(/youtu\.be\/([\w-]{11})/) ??
    url.match(/[?&]v=([\w-]{11})/) ??
    url.match(/youtube\.com\/(?:embed|shorts)\/([\w-]{11})/);
  return m?.[1];
}

function deriveYouTubeThumb(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const id = youTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined;
}

function discordAvatarUrl(author: DiscordAuthor): string | null {
  if (author.avatar) {
    const ext = author.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.${ext}?size=128`;
  }
  // Default avatar — new system uses (id >> 22) % 6, old uses discriminator % 5.
  if (
    author.discriminator &&
    author.discriminator !== "0" &&
    author.discriminator !== "0000"
  ) {
    const idx = Number(author.discriminator) % 5;
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  }
  try {
    const idx = Number(
      (BigInt(author.id) >> BigInt(22)) % BigInt(6),
    );
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  } catch {
    return null;
  }
}

function findClipUrlInContent(content: string | undefined): string | undefined {
  if (!content) return undefined;
  return content.match(CLIP_HOSTS_RE)?.[0];
}

function hostLabelForSource(source: ClipSource): string | null {
  switch (source) {
    case "gifyourgame":
      return "GIFYourGame clip";
    case "medal":
      return "Medal clip";
    case "twitch-clip":
      return "Twitch clip";
    case "youtube":
      return "YouTube";
    case "imgur":
      return "Imgur clip";
    case "x":
      return "X / Twitter clip";
    case "discord-mp4":
      return "Hat clip";
    case "discord-image":
      return "Hat clip";
    default:
      return null;
  }
}

function parseWeekTag(content: string | undefined): string | null {
  if (!content) return null;
  const m = content.match(/\bW(?:k|eek)?\s*(\d{1,2})\b/i);
  return m ? `Wk ${m[1]}` : null;
}

function dateLabelFromTimestamp(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function trimTitle(raw: string): string {
  const cleaned = raw
    .replace(/<@!?\d+>/g, "")
    .replace(/<#\d+>/g, "")
    .replace(/<:[a-zA-Z0-9_]+:\d+>/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "Hat clip";
  return cleaned.length > 90 ? cleaned.slice(0, 87).trimEnd() + "…" : cleaned;
}
