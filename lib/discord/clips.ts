// Server-side adapter for pulling clips from a Discord "highlights" channel.
//
// Discord scraping/api work runs server-side only — never in a Client Component.
// Tokens come from env: DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, DISCORD_CLIPS_CHANNEL_ID.
//
// Today this returns a curated sample so the landing page renders during local
// dev without secrets. When you wire up the bot, replace `getClips()`'s body
// with the live fetch (see TODO inside the function).

import "server-only";

export type ClipPosition = string;

export interface Clip {
  id: string;
  title: string;
  submitter: string;
  team: string;
  week: string;
  duration: string;
  likes: number;
  /** background-position used as a stand-in until real video thumbs land. */
  pos: ClipPosition;
  /** scale used to vary the same Fennec thumb across cards. */
  scale: number;
  /** Once the Discord pipeline lands, fill in: */
  url?: string;
  thumbUrl?: string;
}

export async function getClips(): Promise<Clip[]> {
  // TODO(season-4-launch): replace with live Discord fetch.
  //
  // const token = process.env.DISCORD_BOT_TOKEN;
  // const channelId = process.env.DISCORD_CLIPS_CHANNEL_ID;
  // const res = await fetch(
  //   `https://discord.com/api/v10/channels/${channelId}/messages?limit=20`,
  //   {
  //     headers: { Authorization: `Bot ${token}` },
  //     next: { revalidate: 60 * 5, tags: ["discord:clips"] },
  //   },
  // );
  // const messages = (await res.json()) as DiscordMessage[];
  // return messages
  //   .filter((m) => m.attachments?.some((a) => a.content_type?.startsWith("video/")))
  //   .map(toClip);

  // Empty until Season 4 actually starts and clips begin landing in the
  // Discord highlights channel. The Clips component renders a polished
  // placeholder when this returns []. No fake data shown.
  return [];
}
