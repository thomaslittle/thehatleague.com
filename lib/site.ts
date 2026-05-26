export const SITE = {
  name: "The Hat League",
  shortName: "THL",
  tagline: "More than mid, less than pro.",
  seasonLabel: "Season 04",
  discordInvite: "https://discord.gg/6KAYkCkzJH",
  twitchUrl: "https://www.twitch.tv/hat_dad_gaming",
  twitchHandle: "twitch.tv/hat_dad_gaming",
};

export const THEME_COOKIE = "thl-theme";
export type ThemePref = "light" | "dark";

export const NAV_PRIMARY: { href: string; label: string }[] = [
  { href: "/the-draft", label: "The Draft" },
  { href: "/pool", label: "Player Pool" },
  { href: "/captains", label: "Captains" },
  { href: "/schedule", label: "Schedule" },
  { href: "/standings", label: "Standings" },
  { href: "/clips", label: "Clips" },
];
