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

const SAMPLE_CLIPS: Clip[] = [
  {
    id: "s1",
    title: "Triple reset down 2-0 in the final 30",
    submitter: "BophadesNutz",
    team: "Sombrero · S03 Champs",
    week: "Wk 5",
    duration: "0:18",
    likes: 142,
    pos: "center 35%",
    scale: 1.0,
  },
  {
    id: "s2",
    title: "Flick-shot back-board double-tap",
    submitter: "Neoman47",
    team: "Fedora",
    week: "Wk 3",
    duration: "0:12",
    likes: 96,
    pos: "30% 60%",
    scale: 1.4,
  },
  {
    id: "s3",
    title: "Bumped at the apex, still scored",
    submitter: "ProdigyMETA",
    team: "Fedora",
    week: "Wk 2",
    duration: "0:09",
    likes: 81,
    pos: "75% 50%",
    scale: 1.5,
  },
  {
    id: "s4",
    title: "Goalie demo into open-net empty-cup",
    submitter: "Hat_Dad_Gaming",
    team: "Sombrero",
    week: "Wk 4",
    duration: "0:14",
    likes: 73,
    pos: "50% 70%",
    scale: 1.3,
  },
  {
    id: "s5",
    title: "Last-second save off the post twice",
    submitter: "MajorMalnut",
    team: "Fedora",
    week: "Playoffs",
    duration: "0:11",
    likes: 119,
    pos: "20% 40%",
    scale: 1.6,
  },
  {
    id: "s6",
    title: "Speedflip kickoff, no-touch goal",
    submitter: "iGotAverageMeat",
    team: "Sombrero",
    week: "Wk 1",
    duration: "0:07",
    likes: 64,
    pos: "85% 65%",
    scale: 1.4,
  },
];

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

  return SAMPLE_CLIPS;
}
