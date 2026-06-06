/**
 * Release notes shown to admins at /admin/release-notes. Newest release first.
 * Keep entries human-readable — this is the changelog league ops reads, not a
 * git log. Add a new object to the top of RELEASE_NOTES for each ship.
 */
export type ReleaseSection = { heading: string; items: string[] };

export type ReleaseNote = {
  /** Display version, e.g. "v1.0". */
  version: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Short codename / headline for the release. */
  title: string;
  /** One-line summary shown under the title. */
  summary: string;
  sections: ReleaseSection[];
};

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "v1.0",
    date: "2026-06-06",
    title: "Game on",
    summary:
      "The big one — the draft system, broadcast overlays, the social layer, and Friday Nite Fights all go live together.",
    sections: [
      {
        heading: "Friday Nite Fights — the weekly 2v2",
        items: [
          "Discord-gated registration with automatic, rank-balanced 2v2 team generation and drag-and-drop roster editing for admins.",
          "Swiss rounds that auto-advance: rematch-free pairings, byes handled, and per-game score reporting that anyone on a team (or an admin) can file or fix.",
          "Single-elimination playoffs with a configurable best-of per stage and a separate best-of for the final.",
          "Admin settings dialog for rounds, playoff cut, best-of per stage, and start time (shown in everyone's local time).",
          "A between-tournaments hub: reigning champions, all-time leaderboard, hall of champions, running stats, and a next-Friday CTA — with the full bracket one click away.",
          "Standings use goal differential as the tiebreaker and list each team's players; every entrant's results show on their profile.",
          "Crowning a champion auto-completes the tournament and freezes results (the bracket locks once it's done).",
        ],
      },
      {
        heading: "Rewards & patches",
        items: [
          "Friday Nite Fights now feeds the league points economy — points for playing, wins, playoff wins, finalists, and champions — attributed to the active season so they land on the Power Players leaderboard.",
          "New FNF patches: Night Fighter, Into the Lights, Title Shot, Undefeated, and FNF Champion, plus career milestones Ringside Regular (5+ entries) and Dynasty (3+ titles).",
          "The patches catalog is reorganized into branded category sections.",
          "A patch-unlock broadcast overlay for celebrating earns on stream.",
        ],
      },
      {
        heading: "The Draft",
        items: [
          "Redesigned draft control room with an on-cue pick flow and live player trades.",
          "A draft queue so captains can line up their targets.",
        ],
      },
      {
        heading: "OBS overlay studio (for the broadcast)",
        items: [
          "Branded, browser-source overlays: draft board, on-the-clock, up-next, best-available, last-pick, team roster, prospect spotlight, and ticker.",
          "Plus matchup, standings, power players, lower-third, patch-unlock, and a full-scene overlay.",
          "An admin overlay studio to preview and drive everything live during the stream.",
        ],
      },
      {
        heading: "Social layer",
        items: [
          "Friends: send, accept, and decline requests from /friends or straight off a player's profile.",
          "Direct messages between friends and teammates, delivered live.",
          "Team chat for rostered squads.",
          "Header badges for pending friend requests and unread messages.",
        ],
      },
      {
        heading: "Clips & highlights",
        items: [
          "Submit clips and file uploads attached to a match, an individual game, a team, or a player.",
          "On-site video playback, and multi-clip combine submissions.",
          "Highlight galleries surface on team and player pages.",
        ],
      },
      {
        heading: "SH*T Faced Saturday",
        items: [
          "A new weekly — the friendly Saturday drink-and-play. Crack a cold one, jump in the SFS (BYOB) voice channel, and run casual lobbies with the crew.",
          "House rules included (don't say drink/drank/drunk; own goal means finish your drink; anyone can pitch a new rule).",
        ],
      },
      {
        heading: "Navigation & site polish",
        items: [
          "Mega-menu navigation split into Weeklies, League, Stats, and About, with a dedicated League Ops admin menu; the mobile nav is more compact.",
          "The landing hero features the reigning Friday Nite Fights champions, and the live feed surfaces FNF results.",
          "Mobile horizontal-overflow fixes across the hero and landing page.",
          "Polish across combine, profiles, standings, power rankings, and leaderboards.",
        ],
      },
      {
        heading: "Under the hood",
        items: [
          "Backed by self-hosted Supabase with row-level security and self-gating SECURITY DEFINER functions (no service key), plus realtime updates.",
          "TypeScript types generated directly from the live database schema.",
        ],
      },
    ],
  },
];
