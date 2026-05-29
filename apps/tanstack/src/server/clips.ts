import { createServerFn } from "@tanstack/react-start";

// Minimal Discord clips adapter. Mirrors the Next app's shape so the
// landing component stays portable, but skips the OG-tag scrape +
// Twitch Helix lookup the Next build does — those can be folded in
// later. Required env vars:
//   DISCORD_BOT_TOKEN          — bot user token (needs Message Content
//                                Intent enabled in the Discord Dev Portal)
//   DISCORD_GUILD_ID           — server ID, only used for deep-link
//   DISCORD_CLIPS_CHANNEL_ID   — the clips channel to read

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

export interface Clip {
  id: string;
  title: string;
  source: ClipSource;
  url: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  author: string | null;
  authorAvatarUrl: string | null;
  postedAt: string;
  /** Deep link to the original message in Discord. */
  discordUrl: string | null;
  /** Sum of every Discord reaction on the source message. */
  reactionCount: number;
}

interface DiscordAttachment {
  url: string;
  content_type?: string;
  filename?: string;
}

interface DiscordEmbed {
  url?: string;
  title?: string;
  thumbnail?: { url: string };
  video?: { url: string };
  type?: string;
}

interface DiscordReaction {
  count: number;
}

interface DiscordMessage {
  id: string;
  content: string;
  timestamp: string;
  channel_id: string;
  author?: {
    username?: string;
    global_name?: string | null;
    avatar?: string | null;
    id?: string;
  };
  attachments: DiscordAttachment[];
  embeds: DiscordEmbed[];
  reactions?: DiscordReaction[];
}

const CLIP_HOSTS_RE =
  /\bhttps?:\/\/[^\s<>"']*(gifyourgame\.com|medal\.tv|streamable\.com|twitch\.tv\/[^\s/]+\/clip|clips\.twitch\.tv|youtu\.be|youtube\.com|imgur\.com|twitter\.com|x\.com)[^\s<>"']*/gi;

function classify(url: string): ClipSource {
  if (/gifyourgame\.com/i.test(url)) return "gifyourgame";
  if (/medal\.tv/i.test(url)) return "medal";
  if (/twitch\.tv|clips\.twitch\.tv/i.test(url)) return "twitch-clip";
  if (/youtu\.be|youtube\.com/i.test(url)) return "youtube";
  if (/imgur\.com/i.test(url)) return "imgur";
  if (/twitter\.com|x\.com/i.test(url)) return "x";
  return "other";
}

function avatarUrl(authorId?: string, avatarHash?: string | null): string | null {
  if (!authorId || !avatarHash) return null;
  return `https://cdn.discordapp.com/avatars/${authorId}/${avatarHash}.png`;
}

export const getRecentClips = createServerFn({ method: "GET" })
  .inputValidator((data: { limit?: number } | undefined) => ({
    limit: Math.min(Math.max(data?.limit ?? 12, 1), 50),
  }))
  .handler(async ({ data }): Promise<Clip[]> => {
    const token = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;
    const channelId = process.env.DISCORD_CLIPS_CHANNEL_ID;
    if (!token || !channelId) return [];

    const res = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=50`,
      {
        headers: { Authorization: `Bot ${token}` },
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const messages = (await res.json()) as DiscordMessage[];

    const clips: Clip[] = [];
    for (const m of messages) {
      const author =
        m.author?.global_name ?? m.author?.username ?? "Unknown";
      const avatar = avatarUrl(m.author?.id, m.author?.avatar);
      const discordUrl = guildId
        ? `https://discord.com/channels/${guildId}/${m.channel_id}/${m.id}`
        : null;
      const reactionCount = (m.reactions ?? []).reduce(
        (sum, r) => sum + (r.count ?? 0),
        0,
      );

      // 1) Direct mp4 / image attachments
      for (const att of m.attachments ?? []) {
        const isVideo = att.content_type?.startsWith("video/");
        const isImage = att.content_type?.startsWith("image/");
        if (!isVideo && !isImage) continue;
        clips.push({
          id: `${m.id}-${att.filename ?? att.url}`,
          title: m.content || att.filename || "Clip",
          source: isVideo ? "discord-mp4" : "discord-image",
          url: att.url,
          thumbnailUrl: isImage ? att.url : null,
          videoUrl: isVideo ? att.url : null,
          author,
          authorAvatarUrl: avatar,
          postedAt: m.timestamp,
          discordUrl,
          reactionCount,
        });
      }

      // 2) Discord-resolved embeds (rich previews for known hosts)
      for (const em of m.embeds ?? []) {
        if (!em.url) continue;
        clips.push({
          id: `${m.id}-${em.url}`,
          title: em.title || m.content || "Clip",
          source: classify(em.url),
          url: em.url,
          thumbnailUrl: em.thumbnail?.url ?? null,
          videoUrl: em.video?.url ?? null,
          author,
          authorAvatarUrl: avatar,
          postedAt: m.timestamp,
          discordUrl,
          reactionCount,
        });
      }

      // 3) URLs in the message content that Discord didn't auto-embed
      //    (most often gifyourgame / medal URLs the bot scope can't see)
      const seen = new Set(
        (m.embeds ?? [])
          .map((e) => e.url)
          .filter((u): u is string => !!u),
      );
      const matches = m.content.matchAll(CLIP_HOSTS_RE);
      for (const match of matches) {
        const url = match[0];
        if (seen.has(url)) continue;
        seen.add(url);
        clips.push({
          id: `${m.id}-${url}`,
          title: m.content,
          source: classify(url),
          url,
          thumbnailUrl: null,
          videoUrl: null,
          author,
          authorAvatarUrl: avatar,
          postedAt: m.timestamp,
          discordUrl,
          reactionCount,
        });
      }
    }

    return clips.slice(0, data.limit);
  });
