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
    version: "v1.1",
    date: "2026-06-06",
    title: "Saturday business",
    summary:
      "Weekly-event countdowns and the SH*T Faced Saturday own-goal counter — track the shame, tag the culprits, and put it on the stream.",
    sections: [
      {
        heading: "Weekly-event countdown",
        items: [
          "A self-rolling countdown to the next weekly event on the landing page — it points at Saturday's hang today and rolls itself over to Friday Nite Fights once the night wraps, flipping to 'Happening now' during the window.",
          "The Friday Nite Fights and SH*T Faced Saturday pages each carry their own countdown.",
        ],
      },
      {
        heading: "SH*T Faced Saturday own-goal counter",
        items: [
          "An all-time own-goal counter anyone signed in can add to — tag a registered player or type a name for a guest.",
          "A 'wall of shame' leaderboard and an own-goal count that lands on the tagged player's profile forever.",
          "A nicely-styled OBS overlay (Own Goals counter + worst offender) the streamer can drop in — listed in the overlay studio, updates live.",
        ],
      },
    ],
  },
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
        heading: "The Draft — live draft engine",
        items: [
          "A public live draft board: who's on the clock with a running countdown, the recent-picks feed, a best-available top 10, and the full board filling in by round and team — with an auto pick-reveal as each name lands.",
          "Admin control room — setup: one-click create-a-team-per-captain (captains seeded onto their own roster), then configure roster size (2–8), pick clock (15–300s), and how the order is seeded (rank lowest-first for balance, rank highest-first, random, or manual).",
          "Seed and hand-reorder the draft order, with a live picks-per-team preview before you go live.",
          "Admin control room — live: a big on-the-clock card and countdown, start / pause / resume the clock, nudge it ±15s, force an auto-pick for an AFK captain, undo the last pick, and override who's on the clock at any time.",
          "Make picks by type-to-search (keyboard navigable) with a confirm step; picks are race-safe at the database level so a player can never be double-drafted.",
          "Per-team roster cards show 'needs X' vs 'full' live, and league ops can move a drafted player between teams to handle trades or corrections (captains stay put).",
          "Snake or linear order (configurable), pick-duration tracking, and an automatic flip to 'complete' once every roster is full.",
          "Captain draft queue (/draft/queue): pre-rank the entire available pool before draft night — search, drag to reorder or use arrows, and save. Drafted players drop off the pool live.",
          "Auto-pick fairness: if a captain's clock expires, the system takes the top still-available player from their saved queue, falling back to the best available overall by rank (peak → 3v3 → 2v2 → signup order) — deterministic and fair.",
        ],
      },
      {
        heading: "The Combine — pre-draft scouting",
        items: [
          "Players in the pool build a scouting profile: up to 8 showcase clips (YouTube, Twitch, Streamable, or direct links) that embed and play right on the site, plus a preferred and secondary role (Striker / Playmaker / Defender / Flex), availability, and notes.",
          "Returning players get a tidy 'on the board' summary card with one-click edit; first-timers get the full form.",
          "Completing the combine earns league points and the Combine Ready patch (once per season).",
          "Captains' scouting board: every prospect as a card — avatar, peak/3v3/2v2 ranks, role tags, availability, inline-playable clips, and a Tracker link — with role filters and sort by rank or name.",
          "'Add to my queue' straight from a combine card drops the prospect onto the captain's draft queue.",
          "The combine feeds the draft end-to-end: the queue powers auto-pick, the broadcast 'spotlight' overlay pulls a prospect's role and availability, and entries leave the board the moment they're drafted.",
        ],
      },
      {
        heading: "OBS overlay studio (for the broadcast)",
        items: [
          "Generate a season-pinned overlay token and copy ready-made 1920×1080 transparent browser-source URLs straight into OBS.",
          "The hero 'On the clock' overlay you keep on screen all night: team, captain, and live countdown, auto-playing the pick reveal (with optional sound) and holding it for a configurable 3–30 seconds.",
          "Independent always-on draft overlays: ticker (recent picks + your own pushed messages), best-available top 10, top-prospect spotlight, up-next order (snake-aware), the on-clock team's roster, the full draft board, and a lower-third banner.",
          "Plus broadcast overlays beyond the draft: matchup, standings, power players, and a patch-unlock celebration.",
          "Drive it all live from the studio: toggle the timer / up-next / ticker / reveal sound, set the reveal hold, and push lower-third and ticker text that updates every source instantly.",
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
          "On-site video playback for embeddable links (YouTube, Twitch, Streamable).",
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
