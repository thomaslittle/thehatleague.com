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
  /** One-line description shown under the label in the desktop mega-menus. */
  desc?: string;
}

/** Player Pool stays a standalone top-level link (it carries the live pool count). */
export const NAV_POOL: NavLink = { href: "/pool", label: "Player Pool" };

/**
 * "Weeklies" — the recurring casual events that run every week, kept separate
 * from the season/league machinery: Friday Nite Fights (the 2v2 Swiss) and
 * SH*T Faced Saturday (the friendly Saturday drink-and-play).
 */
export const NAV_WEEKLIES: NavLink[] = [
  {
    href: "/friday-nite-fights",
    label: "Friday Nite Fights",
    desc: "Weekly 2v2 Swiss brawl",
  },
  {
    href: "/shitfaced-saturday",
    label: "SH*T Faced Saturday",
    desc: "BYOB Saturday hangout",
  },
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
      { href: "/the-draft", label: "The Draft", desc: "Live board & order" },
      { href: "/combine", label: "Draft Combine", desc: "Pre-draft scouting" },
      { href: "/captains", label: "Captains", desc: "Meet the team leaders" },
    ],
  },
  {
    title: "Season",
    links: [
      { href: "/schedule", label: "Schedule", desc: "Matches & start times" },
      { href: "/mvp", label: "MVP Vote", desc: "Cast your vote" },
    ],
  },
  {
    title: "More",
    links: [
      { href: "/hub", label: "League Hub", desc: "Everything in one place" },
      { href: "/clips", label: "Clips", desc: "Community highlight reel" },
      { href: "/replays", label: "Replays", desc: "Download match replays" },
      { href: "/patches", label: "Patches", desc: "Badges & unlocks" },
    ],
  },
];

/** "Stats" — the standings/rankings surfaces, split out of League into their own menu. */
export const NAV_STATS: NavLink[] = [
  { href: "/standings", label: "Standings", desc: "Records & tiebreakers" },
  { href: "/power-rankings", label: "Power Rankings", desc: "Who's hot right now" },
  { href: "/leaderboards", label: "Leaderboards", desc: "Stat & points leaders" },
  { href: "/compare", label: "Compare Players", desc: "Head-to-head stats" },
];

/** "League Ops" — admin-only menu mirroring the /admin section tabs. */
export const NAV_LEAGUE_OPS: NavLink[] = [
  { href: "/admin", label: "Overview", desc: "Ops dashboard" },
  { href: "/admin/draft", label: "Draft control", desc: "Run the draft" },
  { href: "/admin/mock", label: "Mock lab", desc: "Build a test league" },
  { href: "/admin/players", label: "Manage players", desc: "Roster & profiles" },
  { href: "/admin/captains", label: "Captains queue", desc: "Approve captains" },
  { href: "/admin/league-ops", label: "Ops applications", desc: "Volunteer apps" },
  { href: "/admin/announcements", label: "Announcements", desc: "Post league news" },
  { href: "/admin/release-notes", label: "Release notes", desc: "What shipped" },
];

/** "About" — mirrors the About column in the site footer. Discord is external. */
export const NAV_ABOUT: NavLink[] = [
  { href: "/about", label: "What is THL", desc: "How the league works" },
  { href: "/rules", label: "Ruleset", desc: "The full rulebook" },
  { href: "/rules#conduct", label: "Code of conduct", desc: "Play nice out there" },
  { href: "/captains", label: "Captains' handbook", desc: "Running a team 101" },
  {
    href: SITE.discordInvite,
    label: "Discord",
    external: true,
    desc: "Join the conversation",
  },
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
