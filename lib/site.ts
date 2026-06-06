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

export interface NavLink {
  href: string;
  label: string;
  /** External links open in a new tab and render as <a> rather than <Link>. */
  external?: boolean;
}

/** Player Pool stays a standalone top-level link (it carries the live pool count). */
export const NAV_POOL: NavLink = { href: "/pool", label: "Player Pool" };

/**
 * "Weeklies" — the recurring casual events that run every week, kept separate
 * from the season/league machinery: Friday Nite Fights (the 2v2 Swiss) and
 * SH*T-Faced Saturday (the friendly Saturday drink-and-play).
 */
export const NAV_WEEKLIES: NavLink[] = [
  { href: "/friday-nite-fights", label: "Friday Nite Fights" },
  { href: "/shitfaced-saturday", label: "SH*T-Faced Saturday" },
];

/**
 * The "League" mega-menu — orange-titled columns grouping how you take part:
 * building a roster (Draft), following the competition (Season), and
 * watching / collecting (More). Stats and About live in their own top-level
 * menus (see below).
 */
export const NAV_LEAGUE_GROUPS: { title: string; links: NavLink[] }[] = [
  {
    title: "Draft",
    links: [
      { href: "/the-draft", label: "The Draft" },
      { href: "/combine", label: "Draft Combine" },
      { href: "/captains", label: "Captains" },
    ],
  },
  {
    title: "Season",
    links: [
      { href: "/schedule", label: "Schedule" },
      { href: "/mvp", label: "MVP Vote" },
    ],
  },
  {
    title: "More",
    links: [
      { href: "/hub", label: "League Hub" },
      { href: "/clips", label: "Clips" },
      { href: "/replays", label: "Replays" },
      { href: "/patches", label: "Patches" },
    ],
  },
];

/** "Stats" — the standings/rankings surfaces, split out of League into their own menu. */
export const NAV_STATS: NavLink[] = [
  { href: "/standings", label: "Standings" },
  { href: "/power-rankings", label: "Power Rankings" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/compare", label: "Compare Players" },
];

/** "League Ops" — admin-only menu mirroring the /admin section tabs. */
export const NAV_LEAGUE_OPS: NavLink[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/draft", label: "Draft control" },
  { href: "/admin/mock", label: "Mock lab" },
  { href: "/admin/players", label: "Manage players" },
  { href: "/admin/captains", label: "Captains queue" },
  { href: "/admin/league-ops", label: "Ops applications" },
  { href: "/admin/announcements", label: "Announcements" },
];

/** "About" — mirrors the About column in the site footer. Discord is external. */
export const NAV_ABOUT: NavLink[] = [
  { href: "/about", label: "What is THL" },
  { href: "/rules", label: "Ruleset" },
  { href: "/rules#conduct", label: "Code of conduct" },
  { href: "/captains", label: "Captains' handbook" },
  { href: SITE.discordInvite, label: "Discord", external: true },
];

/** Every internal league destination — for the search palette quick-nav.
 *  Deduped by href (e.g. /captains is in both the League and About menus). */
export const NAV_ALL: NavLink[] = [
  NAV_POOL,
  ...NAV_WEEKLIES,
  ...NAV_LEAGUE_GROUPS.flatMap((g) => g.links),
  ...NAV_STATS,
  ...NAV_ABOUT.filter((l) => !l.external),
].filter(
  (link, i, all) => all.findIndex((other) => other.href === link.href) === i,
);
