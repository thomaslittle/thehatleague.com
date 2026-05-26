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

export interface Clip {
  id: string;
  title: string;
  submitter: string;
  /** Team name when we know it; empty until the draft populates rosters. */
  team: string;
  /** "Wk 3" parsed from the message, else a month label. */
  week: string;
  /** Empty for now — Discord doesn't expose video duration on attachments. */
  duration: string;
  likes: number;
  /** Deep link the card hyperlinks to. Either the embed URL (YouTube etc.)
   *  or the Discord message permalink. */
  url: string;
  /** Direct mp4 from Discord CDN when the clip was uploaded as a file. */
  videoUrl?: string;
  /** Cover/thumbnail to render in the card. */
  thumbUrl?: string;
  /** Fallback positioning when no thumbUrl exists (used by ClipCard). */
  pos?: string;
  scale?: number;
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
  video?: { url?: string; width?: number; height?: number };
  provider?: { name?: string; url?: string };
}

interface DiscordAuthor {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
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
      // Cache per-render via Next data cache; refresh every 5 minutes or on
      // explicit revalidateTag("discord:clips"). Keeps Discord rate-limit
      // exposure minimal — we re-fetch ~12x/hour total, not per visitor.
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

  return messages
    .map((m) => messageToClip(m, guildId))
    .filter((c): c is Clip => c !== null);
}

// Hosts that members commonly use to share clips. When a message body
// contains a URL on one of these hosts but Discord didn't auto-generate
// an embed (gifyourgame in particular), we still treat the message as a
// clip and link out to the host.
const CLIP_HOSTS_RE =
  /https?:\/\/[^\s]*(?:gifyourgame\.com|medal\.tv|streamable\.com|clips\.twitch\.tv|twitch\.tv\/[^\s]+\/clip|youtube\.com|youtu\.be|imgur\.com|x\.com|twitter\.com)\/[^\s]+/i;

function findClipUrlInContent(content: string | undefined): string | undefined {
  if (!content) return undefined;
  const m = content.match(CLIP_HOSTS_RE);
  return m?.[0];
}

function messageToClip(m: DiscordMessage, guildId: string): Clip | null {
  // Prefer a direct video attachment (mp4/mov/webm).
  const videoAttachment = m.attachments?.find((a) =>
    (a.content_type ?? "").startsWith("video/"),
  );
  // Image attachment (some captains screenshot a clip — better than nothing).
  const imageAttachment = m.attachments?.find((a) =>
    (a.content_type ?? "").startsWith("image/"),
  );
  // A rich embed for a video link (YouTube, Streamable, Twitch clip, etc.).
  const videoEmbed = m.embeds?.find(
    (e) => e.type === "video" || e.video || e.thumbnail,
  );
  // URL to a known clip host in the message text — covers cases where
  // Discord didn't bother generating an embed (gifyourgame is the big one).
  const contentClipUrl = findClipUrlInContent(m.content);

  // Skip messages that carry no recognizable media of any kind.
  if (
    !videoAttachment &&
    !imageAttachment &&
    !videoEmbed &&
    !contentClipUrl
  ) {
    return null;
  }

  const author = m.author;
  const submitter = author.global_name ?? author.username;

  const messageLink = `https://discord.com/channels/${guildId}/${m.channel_id}/${m.id}`;
  const url =
    videoEmbed?.url ??
    videoAttachment?.url ??
    contentClipUrl ??
    messageLink;
  const thumbUrl =
    videoEmbed?.thumbnail?.url ??
    imageAttachment?.proxy_url ??
    imageAttachment?.url ??
    deriveYouTubeThumb(videoEmbed?.url ?? contentClipUrl);

  const likes = (m.reactions ?? []).reduce((sum, r) => sum + r.count, 0);

  // Headline preference order: caption text → embed title → host name → fallback.
  const captionText = m.content?.trim() ?? "";
  // If the only content is a bare URL (very common), don't use it as the
  // title — fall through to the embed title / host name.
  const captionIsJustUrl = /^https?:\/\/\S+\s*$/.test(captionText);
  const titleCandidate =
    !captionIsJustUrl && captionText
      ? captionText
      : (videoEmbed?.title ??
        hostLabelFromUrl(contentClipUrl ?? videoEmbed?.url) ??
        "Hat clip");

  const week =
    parseWeekTag(m.content) ?? monthLabelFromTimestamp(m.timestamp);

  return {
    id: m.id,
    title: trimTitle(titleCandidate),
    submitter,
    team: "",
    week,
    duration: "",
    likes,
    url,
    videoUrl: videoAttachment?.url,
    thumbUrl,
  };
}

function hostLabelFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("gifyourgame")) return "GIFYourGame clip";
    if (host.includes("medal.tv")) return "Medal clip";
    if (host.includes("streamable")) return "Streamable clip";
    if (host.includes("twitch")) return "Twitch clip";
    if (host.includes("youtube") || host.includes("youtu.be")) return "YouTube";
    if (host.includes("imgur")) return "Imgur clip";
    return host;
  } catch {
    return null;
  }
}

function deriveYouTubeThumb(url: string | undefined): string | undefined {
  if (!url) return undefined;
  // Matches youtu.be/<id>, youtube.com/watch?v=<id>, /embed/<id>, /shorts/<id>
  const m =
    url.match(/youtu\.be\/([\w-]{11})/) ??
    url.match(/[?&]v=([\w-]{11})/) ??
    url.match(/youtube\.com\/(?:embed|shorts)\/([\w-]{11})/);
  if (!m) return undefined;
  return `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg`;
}

function parseWeekTag(content: string | undefined): string | null {
  if (!content) return null;
  const m = content.match(/\bW(?:k|eek)?\s*(\d{1,2})\b/i);
  if (!m) return null;
  return `Wk ${m[1]}`;
}

function monthLabelFromTimestamp(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function trimTitle(raw: string): string {
  // Strip Discord's @mentions, channel refs, and URL noise so the headline
  // is just the caption the player wrote.
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
