# The Hat League — Season 4 Draft + Tournament System · Build PRD

> Build plan for the live draft engine, streamer live-pick control room, real-time
> OBS overlay system, and the tournament (schedule + standings + matchups) layer.
> Execute phase by phase. Each phase has a **Definition of Done (DoD)** checklist —
> only check a box when it is genuinely, verifiably true (typechecks, lints, and the
> behavior works). The build is COMPLETE when every box in §13 is checked.

---

## 0. Context & ground rules (read first)

This extends the existing app. **Match the established patterns exactly** — do not
invent new conventions. Key facts from the codebase:

- **Stack:** Next.js 16 (App Router, `proxy.ts` middleware), Supabase (`@supabase/ssr`),
  TanStack Query, Zustand, Tailwind v4. Read `node_modules/next/dist/docs/` before using
  any Next API you're unsure about (per AGENTS.md — this Next has breaking changes).
- **Supabase clients:** `lib/supabase/server.ts` (server), `lib/supabase/browser.ts`
  (browser singleton). Types in `lib/supabase/types.ts` — **regenerate after every
  migration** with `mcp__supabase__generate_typescript_types` and write the result there.
- **Migrations:** apply via `mcp__supabase__apply_migration` (one logical change per
  migration, snake_case name). There is no local `supabase/` dir; the cloud project is
  the source of truth. After applying, run `mcp__supabase__get_advisors` (security +
  performance) and fix what it flags.
- **Server actions** (`app/actions/*`): `"use server"`, auth-guard first, validate, mutate,
  `revalidatePath(...)` generously, return `{ ok?, error?, fieldErrors? }`. Use
  `requireAdmin(path)` from `lib/admin.ts` to gate league-ops writes.
- **Realtime:** `supabase.channel(name).on("postgres_changes", {...}, () => queryClient.invalidateQueries(...)).subscribe()`, cleaned up on unmount. Channel names are
  semantic (e.g. `public:draft_picks:{seasonId}`). See `components/pool/pool-board.tsx`.
- **Query keys:** central factory in `lib/query-keys.ts`. Add new shapes there with an
  `all()` helper for bulk invalidation.
- **Roles:** `profiles.is_admin` = **league ops**; `profiles.is_captain` = captain;
  `profiles.in_player_pool` = draftable. `getViewer()` (`lib/auth/viewer.ts`) exposes
  `isAdmin`, `isCaptain`, `inPool`.
- **Ranks:** `lib/data/rocket-league-ranks.ts` (`RL_RANK_TIERS`), `rank-sort.ts`
  (`rankWeight` — higher = better, -1 unknown), `rank-icons.ts` (`rankIconSrc`),
  `components/ranks/rank-badge.tsx` (`RankBadge`).
- **UI:** `components/ui/data-table.tsx` (`DataTable` + `DataTable.SortableHeader`,
  TanStack table), shadcn primitives in `components/ui/*`, brand tokens in
  `app/globals.css` (`thl-orange`, conference colors `thl-fedora` #60a5fa /
  `thl-sombrero` #4ade80, `font-marker`).
- **Shell/nav:** `components/page/page-shell.tsx`, `page-hero.tsx`; `NAV_PRIMARY` in
  `lib/site.ts`; admin tabs in `components/admin/admin-tabs-nav.tsx`.
- **OG images:** `lib/og.ts` helpers (`loadOgFonts`, `ogBackgroundStyle`, `OG_SIZE`).
- **No `useEffect`** unless genuinely unavoidable (realtime subscription, document
  listeners) — and then leave a `// EFFECT JUSTIFICATION:` comment. Prefer ref-callbacks,
  derived state, server components.
- **Never** commit unless the user asks. Never push to main without being asked. Never
  put service-role keys client-side. Never skip hooks.

### Working discipline for the loop
- Keep `pnpm typecheck` (or `npx tsc --noEmit -p tsconfig.json`) and `npx eslint <files>`
  green after every change. Do not check a DoD box while either is red.
- Build in the phase order below. Within a phase, land vertical slices (schema → types →
  server action/data fetcher → component → page/route → wire realtime) so each step is
  verifiable.
- Seed realistic test data (a fake season, teams, a few picks) so screens render.
- Update `lib/supabase/types.ts` after each migration; never hand-edit row shapes.

---

## 1. Goals

1. **Draft engine** — a fair, timed, snake draft. Captains build rosters from the player
   pool; the system enforces turn order, a per-pick timer, and rank-based fallbacks so no
   one is unfairly disadvantaged.
2. **Streamer control room** — a premium, fast, keyboard-friendly cockpit for the person
   running the live draft on stream: clock controls, on-the-clock team, best-available
   board, one-action picks, undo, and overlay push controls.
3. **OBS overlay system** — token-gated, auth-less, transparent browser-source routes that
   update in **real time** during the draft, plus a control surface so the streamer can
   switch scenes/widgets and push text live.
4. **Tournament system** — rock-solid season structure: teams, schedule generation,
   matchups, results reporting, and auto-computed standings, all visible to players
   ("my team / my schedule / my matchups").
5. **Fairness & transparency** — published draft order, equal timers, deterministic
   tie-breaks, auditable pick history, no silent data loss.

---

## 2. League structure & configuration (make it data-driven)

Do **not** hard-code team counts. Everything configurable per season via a `seasons`
row + a `draft_settings` jsonb, set by league ops in the control room. Sensible defaults
(mirroring Season 3, see PRD Appendix C in `the-hat-league-season4-prd.md`):

- **Conferences:** `Sombrero`, `Fedora` (brand colors already exist). A season may run a
  single pool or split conferences — `seasons.conferences text[]` default `{Sombrero,Fedora}`.
- **Teams:** N captains per conference → N teams (default derived from captain count).
- **Roster size:** `draft_settings.roster_size` (default 3; captain counts as a roster slot
  or not — `captain_is_roster_slot` bool, default true).
- **Draft type:** snake (default) or linear — `draft_settings.type`.
- **Pick timer:** `draft_settings.pick_seconds` (default 60), plus
  `auto_pick_on_timeout` (default true) and `timeout_grace_seconds` (default 0).
- **Seeding:** how the initial draft order is set — `draft_settings.seed_method`:
  - `rank_asc` (default, competitive balance: the captain with the **lowest** peak rank
    picks first),
  - `rank_desc`, `random`, or `manual` (league ops drags to order).

---

## 3. Data model (Supabase — apply via MCP migrations, enable RLS + Realtime)

All tables: `id uuid default gen_random_uuid() primary key` unless noted, `created_at`,
`updated_at` (with the existing `updated_at` trigger pattern), **RLS enabled**. Default
policy: **public `select`** for league/draft/tournament data (it's shown on stream and to
fans); **writes only via server actions** using the service path / `is_admin`/captain
checks encoded as RLS policies. Add tables to Supabase **Realtime publication** where noted.

### 3.1 `seasons`
`name text`, `slug text unique`, `status text check in ('upcoming','draft','regular','playoffs','complete')`
default `upcoming`, `is_active bool` (only one active at a time — partial unique index),
`conferences text[]`, `draft_settings jsonb default '{}'`, `starts_at`, `ends_at`.

### 3.2 `teams`
`season_id fk seasons`, `conference text`, `name text`, `slug text`,
`captain_id fk profiles null`, `seed int null`, `color text null`, `logo_url text null`,
`draft_position int null` (slot in the draft order). Unique `(season_id, slug)`.

### 3.3 `team_members` (rosters)
`team_id fk teams`, `profile_id fk profiles`, `season_id fk seasons`,
`is_captain bool default false`, `overall_pick int null`, `round int null`,
`drafted_at timestamptz null`. Unique `(season_id, profile_id)` — a player is on exactly
one team per season.

### 3.4 `draft_state` (one row per season; the live engine's heartbeat) — **Realtime**
`season_id fk unique`, `status text check in ('setup','live','paused','complete')`
default `setup`, `current_overall_pick int default 1`, `on_clock_team_id fk teams null`,
`current_round int default 1`, `pick_ends_at timestamptz null` (server-authoritative
deadline — the timer is derived from this, never trusted from the client),
`is_paused bool default false`, `paused_remaining_ms int null`, `last_pick_id fk draft_picks null`.

### 3.5 `draft_order` (the seeded order) 
`season_id fk`, `position int`, `team_id fk teams`. Unique `(season_id, position)` and
`(season_id, team_id)`. Snake traversal is computed from this + round.

### 3.6 `draft_picks` — **Realtime**
`season_id fk`, `overall_pick int`, `round int`, `pick_in_round int`,
`team_id fk teams`, `profile_id fk profiles`, `picked_by fk profiles null` (who clicked —
captain or league ops), `auto_picked bool default false`, `pick_duration_ms int null`,
`picked_at timestamptz default now()`. Unique `(season_id, overall_pick)` and
`(season_id, profile_id)`.

### 3.7 `draft_queues` (captain pre-ranked wishlists for fair auto-pick)
`season_id fk`, `team_id fk teams`, `profile_id fk profiles` (the queued player),
`rank int` (1 = top). Unique `(season_id, team_id, profile_id)`. RLS: a captain reads/writes
only their own team's queue; league ops can read all.

### 3.8 `matches` — **Realtime**
`season_id fk`, `week int`, `conference text null`, `round_label text null`
(e.g. 'Regular', 'Play-In', 'Conf Final', 'Grand Final'), `home_team_id fk teams`,
`away_team_id fk teams`, `scheduled_at timestamptz null`,
`status text check in ('scheduled','live','final','forfeit') default 'scheduled'`,
`home_score int default 0`, `away_score int default 0` (series games won),
`best_of int default 5`, `winner_team_id fk teams null`, `bracket text null`,
`challonge_url text null`.

### 3.9 `match_games` (per-game detail, optional fill from ballchasing later)
`match_id fk matches`, `game_number int`, `home_goals int`, `away_goals int`,
`ballchasing_id text null`. Unique `(match_id, game_number)`.

### 3.10 `standings` — computed
Implement as a **Postgres view** `standings_view` derived from `matches` (W/L, GF, GA,
diff, series record), ordered by wins then diff. Expose per conference. (A view keeps it
rock-solid — no drift between matches and standings.)

### 3.11 `overlay_settings` (one row per season; streamer's live overlay state) — **Realtime**
`season_id fk unique`, `active_scene text default 'on_clock'`, `theme text default 'dark'`,
`show_timer bool default true`, `show_recent_picks bool default true`,
`lower_third text null`, `ticker_text null`, `accent text null`, `extras jsonb default '{}'`,
`overlay_token text default gen_random_uuid()` (the token in overlay URLs so the public
route is unguessable but auth-less).

### 3.12 `player_stats` (stub for ballchasing; create now, fill later)
`season_id fk`, `profile_id fk`, `match_id fk null`, `goals int default 0`,
`assists int default 0`, `saves int default 0`, `demos int default 0`,
`score int default 0`. Unique `(season_id, profile_id, match_id)`. Leave a
`// TODO ballchasing` note; do not build ingestion now.

> After creating tables: regenerate types, run advisors, fix RLS/index warnings. Add
> `draft_state`, `draft_picks`, `matches`, `overlay_settings` to the Realtime publication.

---

## 4. Draft engine (server-authoritative, fair)

The **server** owns truth. Clients render from `draft_state` + `draft_picks` and never
compute who's on the clock or whether the timer expired on their own authority.

### 4.1 Turn order (snake)
Given `draft_order` (positions `1..T`) and `round`:
- odd rounds: position `1 → T`; even rounds: `T → 1` (snake) — when `type === 'snake'`.
- `linear`: always `1 → T`.
- `overall_pick → (round, position, team)` is a pure function; implement in
  `lib/draft/order.ts` with unit-tested helpers (`overallToSlot`, `slotToTeam`,
  `nextPick`, `totalPicks`). Pure, no I/O.

### 4.2 Seeding
`lib/draft/seeding.ts`: build `draft_order` from teams per `seed_method`
(`rank_asc` uses captain `peak_rank` via `rankWeight`; ties broken deterministically by
`team.created_at` then `team.id`). League ops can override to `manual` and reorder.

### 4.3 The pick action (`app/actions/draft.ts`)
- `startDraft(seasonId)` — league-ops only: validates teams + order exist + roster targets
  are sane, sets `draft_state.status='live'`, `current_overall_pick=1`, computes
  `on_clock_team_id`, sets `pick_ends_at = now() + pick_seconds`.
- `makePick({ seasonId, profileId })` — **captain of the on-clock team OR league ops**.
  Transactionally: assert draft live + not paused + it's that team's turn + player is in
  pool + not already drafted + roster not full → insert `draft_picks` + `team_members`,
  then advance: compute next pick, update `draft_state` (new on-clock team, `pick_ends_at`,
  round), or set `status='complete'` if all rosters full. Use a Postgres function /
  `execute_sql` in a transaction (or `apply_migration` to create an RPC
  `make_draft_pick(...)`) so concurrency is safe — **no double-picks**.
- `autoPickIfExpired(seasonId)` — idempotent: if `now() > pick_ends_at` and live and not
  paused, pick the on-clock team's **top queued available player**; if their queue is
  empty/exhausted, pick the **best available by `rankWeight(peak_rank)`** (tie-break: best
  3v3, then 2v2, then earliest `in_player_pool` join). Marks `auto_picked=true`. This is
  the fairness backstop. Drive it from the control room (and optionally a scheduled tick).
- `pauseDraft` / `resumeDraft` (store remaining ms on pause, restore on resume),
  `undoLastPick` (league-ops only — removes last `draft_picks` + `team_members` row,
  rewinds `draft_state`), `extendClock(seconds)`, `setOnClock(teamId)` (manual override).
- `setDraftOrder`, `seedTeams`, `createTeamsFromCaptains` (one team per `is_captain`),
  `setRosterTarget`, `updateDraftSettings` — all league-ops only.

### 4.4 Best-available + ranking
`lib/draft/available.ts`: given pool + drafted set, return available players sorted by a
composite weight: primary `rankWeight(peak_rank)`, then 3v3, then 2v2, then join order.
Surface this list in the control room and overlay "best available".

### 4.5 Captain queue
Captains pre-rank players (`draft_queues`) from a board on `/draft/queue` (or within
`/the-draft` when signed in as a captain). Drag-to-reorder (Zustand for local order,
server action to persist). Drives auto-pick + a "your queue" widget.

### 4.6 Draft Combine (pre-draft skill showcase — "NFL combine")
Before draft night, players build a combine profile so captains can scout them.
- Data `combine_profiles`: `season_id fk`, `profile_id fk`, `showcase_clip_url text null`,
  `preferred_role text null` (`Striker | Playmaker | Defender | Flex` — a select),
  `secondary_role text null`, `availability text null`, `notes text null`,
  `submitted_at timestamptz`. Unique `(season_id, profile_id)`. Tracker is the existing
  `profiles.rl_tracker_url`. RLS: a player writes only their own; public read.
- Player submission: a "Combine" form (on `/the-draft` when in the pool, or
  `/combine/submit`) — best clip, preferred role, tracker confirm, short notes.
  `app/actions/combine.ts` `submitCombineProfile(...)` (auth'd, in-pool only).
- **Combine board** `/combine` (and a tab on `/the-draft` pre-draft): captains/everyone
  browse the field like a combine — card per player with avatar, ranks (RankBadge),
  preferred role chip, embedded **best clip**, tracker link, and a "scouting report"
  (§8C.3). Filter by role + rank, sort by rank; captains can **queue** straight from a
  card (§4.5). Real-time as players submit.
- Award points/badge for completing a combine profile (§8E).
- **Feature it on the homepage** as an upcoming event: add season key dates to
  `seasons` (`combine_at`, `draft_at`, `regular_starts_at` timestamptz) and surface an
  **"Upcoming events" / countdown** treatment on the landing hero + a section — e.g.
  "Draft Combine · Coming soon" with a live countdown to `combine_at`, then "Draft Night",
  then "Season kickoff." Reuse the existing hero ticker/announcement style; when a date is
  set, show the countdown; when null, show "Date TBA". A small `lib/data/events.ts` derives
  the ordered upcoming events from the active season's key dates. The combine CTA links to
  `/combine` (browse) or the submission form (if in pool).

---

## 5. Live draft board (public, real-time) — `/the-draft` upgrade + `/draft`

Replace the reserved panels in `app/the-draft/page.tsx` with the **live board** when a
draft is live/complete; keep the "get ready" content when `status='upcoming'`.

- **On the clock** card: team, captain avatar, **live countdown** (derived from
  `draft_state.pick_ends_at` via a client ticker; no `useEffect` for the value — use a
  ref-driven `requestAnimationFrame` or `setInterval` set up in a ref-callback with
  cleanup, justified).
- **Pick board / grid:** every team as a column, rounds as rows, filled picks show the
  player (RankBadge). Snake direction indicated.
- **Recent picks** feed with a reveal animation on new picks (Realtime insert → animate).
- **Best available** mini-table (DataTable).
- Realtime: subscribe to `draft_state` + `draft_picks` for the active season; invalidate
  query keys. Everything updates the instant a pick lands.

### 5.1 NFL-draft feel + the coin-flip pick reveal (signature moment)
Make the board feel like an **NFL Draft broadcast** — big, theatrical, premium. The
centerpiece is the **pick reveal**: when a new `draft_picks` row arrives via Realtime, play
the league's coin-flip "THE PICK IS IN" clip at `public/brand/videos/draft_pick.mp4`
(6s, faststart-optimized — autoplay muted, plays once) as a full-bleed/centered reveal
overlaying the board, then resolve into the drafted player's card (avatar, name, ranks via
RankBadge, the team that picked, round/overall number) with a confident motion. Reuse the
robust one-shot-video pattern from `components/landing/hero-logo-intro.tsx` (autoplay/muted/
playsInline/preload, fade in/out via events, no `useEffect` for visibility, respects
`prefers-reduced-motion` → skip the clip and just animate the card). The same coin-flip
reveal is the heart of the OBS `last-pick` overlay (§7) and can be triggered from the
control room ("trigger pick reveal"). Build a reusable `<PickReveal pick={...} sound? />` component
used by both the public board and the overlay. Big type (`font-marker`), team colors,
"ON THE CLOCK" / "THE PICK IS IN" broadcast captions, draft-order ticker — channel the NFL
draft stage. **Sound:** play `public/brand/sounds/draft_sound.mp3` with the reveal — but
only where audio autoplay is allowed: ON by default in the **OBS overlay** (`last-pick`)
and on a **control-room-triggered** reveal (both effectively user/streamer-initiated); on
the public board keep it **muted by default** with an optional "unmute" toggle (browsers
block unsolicited audio). Gate the sound behind a `sound` prop, preload the audio, and
respect `prefers-reduced-motion` (skip video+sound, just animate the card).

---

## 6. Streamer control room — `/admin/draft` (league-ops gated)

A premium cockpit. Add an **admin tab** "Draft" (`components/admin/admin-tabs-nav.tsx`).
Layout: big, high-contrast, keyboard-driven.

- **Setup mode** (`status='setup'`): create teams from captains, choose seed method,
  drag to reorder `draft_order`, set roster size + timer, preview the full snake order,
  then **Start draft**.
- **Live mode**:
  - Huge **on-the-clock** panel: team + captain + big timer with **Pause / Resume /
    +15s / Reset** controls.
  - **Make pick**: fast searchable player list (best-available default sort, search by
    name/handle), `Enter`/click to select → **confirm** (guard against misclicks) → pick.
    Keyboard: `/` focus search, `↑/↓` move, `Enter` confirm.
  - **Undo last pick**, **Skip/auto-pick now**, **Set on-clock** override.
  - **Roster panels** for all teams (live), **draft order** rail with current highlighted.
  - **Overlay controls** (see §7): scene switcher, toggles, lower-third / ticker text
    inputs that push live, "trigger pick reveal" button, copy overlay URLs.
- Everything writes via `app/actions/draft.ts`; everything reflects via Realtime so the
  control room, public board, and overlay stay in lockstep.

---

## 7. OBS overlay system (real-time, token-gated, auth-less)

Browser sources the streamer adds in OBS. Routes live under `/overlay/*`, use a minimal
root (no `PageShell`, no header/footer), transparent/dark backgrounds, large `font-marker`
type, and read **only public data** gated by `?token=` matching
`overlay_settings.overlay_token` (reject otherwise → blank). No auth cookies (OBS has none).

Implement as a dedicated route group `app/(overlay)/overlay/...` with its own minimal
`layout.tsx` (transparent `<body>` bg, no chrome) so it doesn't inherit the site shell.

**Widgets (each its own browser-source URL):**
- `/overlay/draft/on-clock` — current team, captain, live timer, pick number/round.
- `/overlay/draft/last-pick` — the signature **coin-flip pick reveal** (the shared
  `<PickReveal>` from §5.1 using `public/brand/videos/draft_pick.mp4`) → resolves to the
  player card + team + round; auto-hides after N seconds. Transparent bg so it composites
  over the stream.
- `/overlay/draft/ticker` — horizontal scroll of recent picks + `overlay_settings.ticker_text`.
- `/overlay/draft/board` — compact full draft grid (all teams/rounds).
- `/overlay/draft/roster?team=slug` — a single team's roster, live.
- `/overlay/draft/best-available` — top N undrafted by rank.
- `/overlay/lower-third` — `overlay_settings.lower_third` text banner.
- `/overlay/standings` and `/overlay/matchup?id=` — for tournament streams.
- `/overlay/scene` — a **director** view that renders whichever widget
  `overlay_settings.active_scene` selects, so the streamer can run ONE browser source and
  switch scenes from the control room.

**Real-time + tooling:**
- Each overlay subscribes to `draft_state` / `draft_picks` / `overlay_settings` Realtime
  and re-renders instantly. No polling.
- The control room writes `overlay_settings` (active_scene, toggles, lower_third, ticker,
  accent, theme) via a server action; overlays react live.
- Provide a `/admin/draft` "Overlay" sub-panel listing every overlay URL with the token
  baked in + copy buttons + a thumbnail/preview, and the live scene switcher.
- Respect `prefers-reduced-motion` for animations; keep widgets resilient to missing data
  (never crash a stream — render a tasteful empty/standby state).

---

## 8. Tournament system (schedule, matchups, standings, results)

### 8.1 Schedule generation (`lib/tournament/schedule.ts` + `app/actions/tournament.ts`)
- League-ops action `generateSchedule(seasonId)` — round-robin within each conference
  (configurable double round-robin / weeks), inserts `matches`. Pure pairing helper
  (circle method) is unit-testable; the action persists. Idempotent / regenerable with a
  guard (warn before overwriting existing non-final matches).
- `setMatchSchedule(matchId, scheduledAt)`, `reportMatchResult(matchId, homeScore,
  awayScore, games?)` — captains of involved teams or league ops; sets `status='final'`,
  `winner_team_id`; standings view recomputes automatically.

### 8.2 Pages
- **`/schedule`** — upgrade: full season calendar grouped by week/conference (live from
  `matches`), each match a card (teams, time, status, score). Filter by conference/team.
  Signed-in players get a **"My team"** toggle to see only their matchups.
- **`/standings`** — keep Season 3 historical block; add the **live Season 4** standings
  from `standings_view` per conference (DataTable, sortable), plus playoff bracket area.
- **`/teams/[slug]`** — team page: roster (RankBadge), schedule, record, captain.
- **Dashboard** (`app/dashboard/page.tsx`) — add a **"Your team"** card for drafted
  players: team, next matchup, record, link to schedule.

### 8.3 Realtime
Subscribe to `matches` on `/schedule`, `/standings`, team pages, and the dashboard card so
results/schedule changes appear live.

---

## 8A. "ESPN" feel — power rankings & editorial content

This is a league for **adults who love sports** — it should feel like a real broadcast
property as the season runs. Build the surfaces that make it feel alive and authoritative.

### 8A.1 Power rankings
- Table `power_rankings`: `season_id fk`, `week int`, `team_id fk teams`, `rank int`,
  `previous_rank int null`, `blurb text null`, `created_at`. Unique `(season_id, week, team_id)`.
- `lib/tournament/power-rankings.ts`: auto-**suggest** a ranking from `standings_view` +
  recent form (last-N results, goal diff, streak) — league ops review and edit the order +
  write a one-line blurb per team, then publish.
- `app/actions/tournament.ts`: `publishPowerRankings(seasonId, week, rows[])` (league-ops).
- **Page `/power-rankings`** (and a block on `/standings` + landing): ESPN-style ranked
  list with **movement arrows** (▲▼ vs `previous_rank`, with delta), team color, record,
  and the blurb. Realtime.

### 8A.2 League hub / editorial
- A weekly content surface: reuse `announcements` with a `kind` column
  (`announcement | recap | preview | feature | award`) — add the column via migration — or
  a dedicated `league_posts` table if cleaner. League ops author **weekly recaps**,
  **matchup previews**, and **features**.
- **Page `/hub`** (a.k.a. "League"): newsfeed of posts + the current power rankings + stat
  leaders + player/team of the week. This is the front door for "what's happening."
- Auto-generated content helpers (so it's not all manual): "Stat of the week", "Top
  performers", "Biggest mover", "Upset of the week" computed from stats/matches and offered
  as draft blurbs the league ops can publish.

### 8A.3 Leaderboards (live, ESPN-style)
- Upgrade `/leaderboards` (`app/leaderboards/page.tsx`, `components/landing/leaderboards-explorer.tsx`)
  to surface **live Season 4** stat leaders (goals, assists, saves, demos, MVP score, plus
  per-game averages) from `player_stats`, with conference + per-game/total toggles and rank
  badges. Keep the Season 3 historical view as a selectable season.
- **Player of the Week / Team of the Week** widgets (computed), shown on `/hub`, landing,
  and as overlay widgets.

---

## 8B. Awards & badges (unlockable, progress through the season)

Players unlock badges for stats, wins, and milestones as the tournament progresses —
collectible, shown off, and great content.

### 8B.1 Data
- `badges` (catalog): `slug text unique`, `name`, `description`, `category text`
  (`scoring | defense | aggression | team | milestone | special`), `tier text`
  (`bronze | silver | gold | legendary`), `icon text` (lucide name or `/brand/badges/*`),
  `criteria_type text`, `criteria jsonb`, `is_active bool`. Seed a starter set (below).
- `player_badges` (earned): `profile_id fk`, `badge_id fk`, `season_id fk null`,
  `awarded_at timestamptz default now()`, `context jsonb` (e.g. the match/value that
  triggered it). Unique `(profile_id, badge_id, season_id)`. **Realtime** so unlocks can pop.

### 8B.2 Award engine
- `lib/awards/engine.ts`: pure, **idempotent** evaluator run after every stat/match update
  (and on demand). Given a player's aggregated stats + results, returns the set of badges
  they now qualify for; `app/actions/awards.ts` (or the stat-ingest path) persists newly
  earned ones and optionally fires an overlay/Discord notification.
- Starter badge set (seed): Hat Trick (3 goals in a game), Playmaker (X assists), Wall
  (X saves in a game / season), Wrecking Ball (X demos), Sniper (X goals season), Iron Man
  (played every match), Win Streak (3/5 in a row), Conference Champ, Grand Champion,
  First Overall Pick, Last Pick Hero (low draft slot, high finish), MVP, Shutout (win a
  game without conceding), Comeback, Debut (first match), Veteran (Nth season). Make adding
  badges data-driven via `criteria`.

### 8B.3 Display
- **Profile badge case** on `/players/[username]` (earned + locked-with-progress, by tier).
- **`/badges`** catalog page (what exists, how to earn, who's earned each).
- Overlay widget `/overlay/badge-unlock` + a toast/feed when a badge is earned (Realtime).
- Badge chips next to names on rosters/leaderboards where space allows.

---

## 8C. Player profiles that compound over seasons (scouting-grade)

`/players/[username]` (`app/players/[username]/page.tsx`) becomes a rich, auto-updating
profile — so captains have deep data for future drafts.

### 8C.1 Data
- `player_season_stats` — aggregate **view** (or materialized table refreshed on result
  report) from `player_stats` + `matches`: per `(season_id, profile_id)` totals + per-game
  averages + games played + team + final placement + W/L.
- `profile_rank_history`: `profile_id fk`, `rank_2v2`, `rank_3v3`, `peak_rank`,
  `captured_at` — snapshot whenever ranks change (`ranks_updated_at`), so a player's rank
  trajectory is graphable over time. Write a snapshot in the onboarding/rank-update path.
- Draft history is already in `team_members` (overall_pick, round, team, season) — surface
  it; team history from `team_members` across seasons.

### 8C.2 The profile page (auto-generated, content-rich)
- **Header**: avatar/banner, ranks (RankBadge), current team + role, season + career lines.
- **Career stats** table: per-season splits (G/A/Sv/Demo, per-game), career totals, bests.
- **Badge case** (§8B.3), **draft history** (where/when/by whom drafted each season),
  **match log** (recent results with their team), **rank history** chart (sparkline/line),
  **awards/accolades**, and an **auto-generated "scouting report"** sentence or two
  (strengths from stat profile, e.g. "Elite shot-stopper — top-10 saves/game in S4").
- **Realtime**: subscribe to this player's `player_stats` / `player_badges` so the page
  updates the moment stats/badges land mid-season.
- **Captain tools**: a compare view and filters on `/pool` / a scouting view so captains
  can stack players up using career data. Keep it fast (DataTable).

### 8C.3 Content generation
- `lib/players/scouting.ts`: pure helpers that turn a stat profile into ranked superlatives
  / a short report (percentile vs the field). Used on the profile, leaderboards, hub, and
  draft control "best available" tooltips.

---

## 8D. Match center — every matchup gets its own page

Route **`/matches/[id]`** (link every match card on `/schedule`, team pages, standings,
and the hub to it). The page has two states driven by `matches.status`:

### 8D.1 Preview (status `scheduled` / `live`)
A broadcast-style fight card:
- **Header**: `Team A vs Team B` with team colors/logos, week + round label, scheduled
  time (local), and a **WATCH LIVE** button (Twitch link; pulses when `status='live'` or
  Twitch reports live).
- **Captain matchup**: the two captains side by side (avatars, ranks, records).
- **Predictions**: signed-in users pick a winner (and optional score). Live tally bar
  ("68% Das Boost"). Locks at start time.
- **Roster comparison**: both rosters side by side with ranks + key season stats, plus an
  aggregate "team strength" line (avg rank / form).
- **Head-to-head record**: prior `matches` between these teams (this + past seasons),
  series tally, last result.

### 8D.2 Recap (status `final`)
- **Final score** + series breakdown (`match_games`).
- **Top performer**: highest MVP-score player from the match (auto), with their line.
- **Highlights**: clips attached to this match (`clips` table, see §8E) in a grid/player.
- **Replay downloads**: ballchasing / replay links per game (`match_games.ballchasing_id`
  + an optional `replay_url`), with download buttons.
- **Box score**: per-player stats for the match.
- **Prediction results**: who called it; accuracy feeds the points economy.

### 8D.3 Data
- `match_predictions`: `match_id fk`, `profile_id fk`, `predicted_winner_team_id fk`,
  `predicted_home_score int null`, `predicted_away_score int null`, `created_at`. Unique
  `(match_id, profile_id)`. RLS: a user writes only their own, before kickoff. **Realtime**
  for the live tally.
- `lib/tournament/head-to-head.ts`: pure helper computing H2H from `matches`.
- `app/actions/predictions.ts`: `submitPrediction(...)` (auth'd, locks after `scheduled_at`).
- OG image for `/matches/[id]` (reuse `lib/og.ts`) — shareable fight cards.
- **Realtime**: subscribe to the match row + predictions + clips so preview→live→recap and
  the tally update live.

---

## 8E. Points & engagement economy (unique ways to earn)

Beyond auto stat badges (§8B), reward **participation and content**, so the community stays
engaged all season and players rack up a meaningful score. This powers a **player power
ranking** (people, not just teams) — very ESPN.

### 8E.1 Points ledger
- `point_events`: `profile_id fk`, `season_id fk null`, `source text`, `points int`,
  `ref_type text null`, `ref_id text null` (the match/clip/etc.), `note text null`,
  `created_at`. Append-only ledger — never mutate; total = sum. **Idempotent** inserts
  (unique `(profile_id, source, ref_type, ref_id)` where applicable) so re-runs don't
  double-award.
- `player_points_view`: sum per `(season_id, profile_id)` + career total.

### 8E.2 Earning sources (`lib/awards/points.ts` — central, tunable table of values)
- **On-field**: win (+), goal/assist/save/demo (small +), shutout, hat trick, MVP of a
  match (+big), clean sheet, comeback.
- **MVP votes**: peers/fans vote post-match (`mvp_votes`: `match_id`, `voter_id`,
  `profile_id`, unique `(match_id, voter_id)`, RLS one vote each) — receiving votes earns
  points; winning match MVP earns more. Realtime tally.
- **Clips**: uploading/submitting a clip (`clips` table: `profile_id`, `season_id null`,
  `match_id null`, `title`, `url` or storage path, `thumbnail_url`, `approved bool`,
  `votes int`, `created_at`) earns points; **clip of the week**, clip upvotes earn more.
  (Tie into the existing Discord `clips` flow where possible.)
- **Predictions**: correct match prediction earns points; perfect-score bonus; streaks.
- **Engagement/milestones**: completing profile, first clip, Iron Man, season-long
  participation, climbing the rankings.
- Keep all point values in ONE config object so the league can tune the economy without
  hunting through code.

### 8E.3 Surfaces
- **Player power ranking** (`/leaderboards` tab + `/hub` + overlay): players ranked by
  season points with movement.
- Points + recent point events on `/players/[username]` ("how they're earning").
- Earning a milestone can grant a badge (§8B) — wire the engine to both.
- `app/actions/clips.ts` (submit/upvote), `app/actions/votes.ts` (MVP vote), with RLS +
  realtime. Moderation flag (`approved`) for clips, league-ops managed.

---

## 9. Routes & navigation

- Add to `NAV_PRIMARY` (`lib/site.ts`) only what belongs in primary nav (keep it tight):
  `The Draft` (exists), `Player Pool` (exists), `Schedule`, `Standings`, `Clips` (exist).
  Add `Teams` if it reads well; otherwise link teams from standings/schedule.
- New admin tab: `Draft` → `/admin/draft`.
- New overlay route group: `app/(overlay)/overlay/...` (excluded from nav, sitemap, and
  the auth proxy allowlist; ensure `proxy.ts` does not gate `/overlay`).
- Add player-facing draft views under `/the-draft` (live board) and a captain queue view.
- Add OG images for `/teams/[slug]` and the live draft (reuse `lib/og.ts`).

---

## 10. Real-time & query architecture

- Extend `lib/query-keys.ts`:
  `draft: { state(seasonId), picks(seasonId), order(seasonId), queue(seasonId, teamId), available(seasonId) }`,
  `teams(seasonId)`, `matches: { all(seasonId), week(seasonId, week), team(seasonId, teamId) }`,
  `standings(seasonId)`, `overlay(seasonId)`.
- One reusable hook per live entity (e.g. `useDraftState`, `useDraftPicks`,
  `useOverlaySettings`, `useMatches`) that does `useQuery(initialData) + realtime channel
  invalidate`. Put them in `lib/hooks/` or co-located. Reuse the pool-board pattern.
- Server components fetch initial data and pass `initialData` so there's no waterfall.

---

## 11. Fairness, integrity, edge cases (must handle)

- **No double-pick / race:** the pick mutation is a single transactional RPC with the
  uniqueness constraints as the final guard.
- **Timer is server time:** clients render from `pick_ends_at`; expiry is decided server-side
  in `autoPickIfExpired`. Pausing freezes remaining time exactly.
- **Auto-pick is fair:** queue first, then deterministic best-available; never a random
  loss of value, never a skipped pick.
- **Undo is safe:** rewinds state + removes roster row atomically; control-room only.
- **Disconnect resilience:** any client reload reconstructs full state from the DB.
- **Roster completeness:** draft completes only when every team hits the roster target;
  guard against over-/under-filling.
- **RLS correctness:** captains can only pick for their own team and queue their own team;
  league ops can do everything; public can only read. Verify with advisors + a manual
  check.
- **Empty/standby states** everywhere (no live season, draft not started, no matches yet)
  — never blank, never crash, never block a stream.

---

## 12. Out of scope (stub only)
- ballchasing.com stat ingestion (create `player_stats` + a `getBallchasingStats()` stub).
- Automated Discord DMs for matchups/draft alerts (the webhook + `sendDiscordMessage`
  stub already exist; optionally fire a webhook on draft start / pick, but don't build full
  bot messaging).
- Payments, multi-game support beyond Rocket League.

---

## 13. Definition of Done (the build is complete when ALL are checked)

**Schema & infra**
- [ ] All §3 tables created via migrations, RLS enabled with correct policies, Realtime
      enabled on `draft_state`/`draft_picks`/`matches`/`overlay_settings`,
      `standings_view` created.
- [ ] `lib/supabase/types.ts` regenerated; advisors run and clean (or warnings justified).
- [ ] Seed data: one active Season 4, teams from current captains, a draftable pool, and a
      few sample matches so every screen renders.

**Draft engine**
- [ ] `lib/draft/{order,seeding,available}.ts` pure helpers exist and are correct
      (snake math verified, e.g. a tiny test or asserted examples).
- [ ] `app/actions/draft.ts` implements start/makePick(RPC, race-safe)/autoPick/pause/
      resume/undo/extend/setOnClock/setup actions, all league-ops or on-clock-captain
      gated, with `revalidatePath`.
- [ ] Captain queue (`draft_queues`) read/write with RLS; drives auto-pick.

**Live board & control room**
- [ ] `/the-draft` shows the live, real-time board (on-clock, timer, pick grid, recent
      picks, best available) when a draft is live; "get ready" otherwise.
- [ ] NFL-draft feel: reusable `<PickReveal>` plays `public/brand/videos/draft_pick.mp4`
      coin-flip on each new pick (board + overlay last-pick + control-room trigger),
      resolving to the player card; broadcast captions, team colors, reduced-motion safe.
- [ ] `/admin/draft` control room: setup (teams/seed/order/settings/start) + live cockpit
      (timer controls, fast searchable pick + confirm, undo, overrides, roster panels,
      overlay controls, keyboard shortcuts).

**Overlay system**
- [ ] `app/(overlay)/overlay/*` route group with minimal transparent layout, token-gated.
- [ ] Widgets: on-clock, last-pick (animated), ticker, board, roster, best-available,
      lower-third, standings, matchup, and a `scene` director driven by
      `overlay_settings.active_scene`.
- [ ] All overlays update in real time; control room pushes scene/toggles/text live; URLs
      + copy buttons listed in the control room.

**Tournament**
- [ ] Schedule generation + result reporting actions (gated), `matches` populated.
- [ ] `/schedule` (live, "my team" filter), `/standings` (live S4 from view + S3
      history), `/teams/[slug]`, and a dashboard "your team / next matchup" card —
      all real-time.

**ESPN feel, awards, profiles**
- [ ] `power_rankings` table + auto-suggest helper + `publishPowerRankings` action +
      `/power-rankings` (movement arrows, blurbs, realtime) and a block on `/standings`.
- [ ] League hub `/hub`: newsfeed (recaps/previews/features via `announcements.kind` or
      `league_posts`), power rankings, stat leaders, player/team of the week.
- [ ] `/leaderboards` shows live Season 4 stat leaders (conference + per-game/total
      toggles, rank badges); Season 3 still selectable.
- [ ] `badges` + `player_badges` tables (Realtime), starter badge set seeded,
      idempotent `lib/awards/engine.ts`, awarding wired into the stat/result path,
      `/badges` catalog, profile badge case, and `/overlay/badge-unlock` widget.
- [ ] `/players/[username]` enriched: career + per-season stats, draft history, match log,
      rank-history chart, badge case, auto "scouting report"; updates in real time;
      `profile_rank_history` + `player_season_stats` view; captain compare/scouting view.

**Match center, combine, engagement**
- [ ] `/matches/[id]` with preview (header + WATCH LIVE, captain matchup, predictions w/
      live tally, roster comparison, head-to-head) and recap (final/series, top performer,
      highlights, replay downloads, box score, prediction results); realtime; OG image.
      Every match card across the app links here.
- [ ] `combine_profiles` + `submitCombineProfile` action; `/combine` board (clip, role,
      tracker, scouting report, filter/sort, queue-from-card), realtime; combine submission
      form for in-pool players.
- [ ] Points economy: `point_events` ledger (idempotent) + `player_points_view`,
      central tunable `lib/awards/points.ts`, `mvp_votes` + `clips` tables/actions
      (RLS, realtime), player power ranking surfaced on `/leaderboards`/`/hub`/overlay and
      on profiles.
- [ ] Homepage features upcoming events: `seasons` key dates (`combine_at`/`draft_at`/
      `regular_starts_at`), `lib/data/events.ts`, and a landing countdown/"coming soon"
      treatment (Combine → Draft → Kickoff) wired to the active season.

**Quality gate**
- [ ] `npx tsc --noEmit` clean. `npx eslint` clean on all new/changed files.
- [ ] No `useEffect` without a `// EFFECT JUSTIFICATION:` comment.
- [ ] Brand-consistent (thl-orange, conference colors, font-marker), responsive, no
      mobile horizontal scroll, dark+light correct, reduced-motion respected.
- [ ] Empty/standby/error states everywhere; reload reconstructs state; no double-picks.

---

## 14. Suggested build order (vertical slices)
1. Schema + types + seed (§3) → 2. Draft pure helpers + actions + RPC (§4) →
3. Live board (§5) → 4. Control room (§6) → 5. Overlay group + widgets + control (§7) →
6. Tournament schema usage: schedule gen + pages + standings view (§8) →
7. Dashboard/team pages + nav (§8.2, §9) → 8. Polish, empty states, advisors, a11y (§11).
