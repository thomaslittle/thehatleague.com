# The Hat League — Season 4 Platform · Build PRD

---

## 0. Context

You are building the web platform for **The Hat League (THL)** — a community Rocket League tournament series for a group of dads. This is **Season 4**. The league was previously run entirely on spreadsheets; this platform replaces that.

A **landing page already exists** in this repo and is the starting point. It is also the **single source of truth for the aesthetic** — every page, component, and flow you build must match its typography, color palette, spacing, motion, and overall vibe. Do not introduce a new design language.

The Discord community is the social hub: `https://discord.gg/6KAYkCkzJH`

**Scope of THIS build (be disciplined):** get users registering via Discord, landing on a beautiful authenticated dashboard, and seeing well-designed pages for everything in the nav — most of which are intentionally "coming soon" placeholders until the league structure is finalized. The draft mechanics, team structure, and live stats pipeline are **deliberately out of scope right now**; I will return with the exact structure and we'll build those next.


## 2. Tech stack & hard constraints

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js** (already installed) | Use the App Router. |
| Styling | **Tailwind CSS** | Centralize design tokens from the landing page. |
| Backend / DB / Auth | **Supabase** | Provision the schema **via the Supabase MCP**. |
| Server state | **TanStack Query** | ALL server state goes through Query. No ad-hoc fetching in components. |
| Local/client state | **Zustand** | ALL local UI state. No prop-drilling, no context-as-store. |
| Effects | **No `useEffect`** | Avoid entirely. Treat any use as a code smell requiring justification. |

### State-management rules (enforce these)
- **Server data** (profiles, player pool, stats, standings) → TanStack Query hooks only. Co-locate query keys in a central `queryKeys` factory.
- **Client data** (modals open, multi-step form progress, filters) → Zustand stores.
- **Instead of `useEffect`**, prefer: data fetching via Query (with `enabled`, `select`, suspense boundaries), event handlers for user-driven side effects, derived state computed during render, Next.js Server Components / server actions for server-side work, and route-level `loading.tsx` / `error.tsx`. If you believe an effect is genuinely unavoidable, leave a `// EFFECT JUSTIFICATION:` comment explaining why no alternative works.
- Prefer **Server Components** for static/SEO content (landing sections, rules) and **Client Components** only where interactivity demands it.

---

## 3. Authentication — Discord only

- Use **Supabase Auth with the Discord OAuth provider**. Discord is the only sign-in method.
- Request scopes sufficient to read the user's Discord **id, username, global name, and avatar** (and `guilds`/`guilds.members.read` if needed for the server-membership and clips features in §7).
- On first sign-in, create a row in `profiles` (see §5) and route the user into the **registration flow** (§4). Returning users skip straight to the dashboard.
- Store the Discord user id so we can later DM users/captains and match them to Discord activity.

---

## 4. Registration flow (post-Discord)

After Discord auth, a new user completes a short, beautifully designed onboarding that matches the landing aesthetic:

1. Confirm Discord identity (show their avatar + name pulled from auth).
2. **Collect their Rocket League Tracker URL** (e.g. a `rocketleague.tracker.network` profile link). Validate the format.
3. From that tracker, we need their **current 2v2 rank, current 3v3 rank, and highest rank ever achieved (peak, any season, any playlist)**, sourced from `https://rocketleague.tracker.network/`.
4. Persist everything to their `profile` and mark them as available for the **player pool**.

### ⚠️ The Cloudflare problem (read carefully)
`rocketleague.tracker.network` sits behind Cloudflare bot protection that **blocks programmatic/datacenter access** — which means a normal Vercel/Supabase serverless function will be blocked. It reportedly works from **localhost / a real browser context**.

Build this the right way so we're not boxed in:

- Implement rank ingestion behind a **single service interface**, e.g. `getTrackerRanks(trackerUrl): Promise<{ rank2v2, rank3v3, peakRank, peakPlaylist }>`. The UI and DB never care how it's implemented.
- Ship the MVP with **two interchangeable adapters**:
  1. **Manual-confirm adapter (default for now):** store the tracker URL, render the profile link, and let the user enter/confirm their three ranks via a clean form. This unblocks registration today with zero scraping risk.
  2. **Automated adapter (stub + recommended path):** a swappable backend that actually fetches the ranks. Recommended implementations, in order of robustness:
     - A **headless-browser worker with residential/stealth networking** (Playwright + stealth via a service like Browserless / ScrapingBee / Bright Data) exposed as an internal endpoint.
     - A **local companion worker** run from a residential IP (matches the "works from localhost" behavior you noted) that scrapes and writes to Supabase using the service-role key.
     - A reputable **third-party RL rank API** if one with acceptable ToS is available.
- Treat ranks as **refreshable**: store `ranks_updated_at` and design so we can re-pull later without changing the UI.
- Never put secrets/service-role keys in the client. Scraping/automation runs server-side or in the companion worker only.

**For this build:** wire up adapter #1 end to end, and leave adapter #2 as a clearly-marked, dependency-injected stub with TODOs.

---

## 5. Supabase schema (provision via Supabase MCP)

Keep it **minimal but extensible** — the league/team/draft structure is TBA, so set up what registration and the player pool need now, and stub the rest with comments.

**`profiles`** (1:1 with `auth.users`)
- `id` (uuid, PK, refs `auth.users.id`)
- `discord_id` (text, unique)
- `discord_username` (text)
- `discord_global_name` (text, nullable)
- `discord_avatar_url` (text, nullable)
- `rl_tracker_url` (text, nullable)
- `rank_2v2` (text, nullable)
- `rank_3v3` (text, nullable)
- `peak_rank` (text, nullable)
- `peak_rank_playlist` (text, nullable)
- `ranks_updated_at` (timestamptz, nullable)
- `in_player_pool` (boolean, default true)
- `is_captain` (boolean, default false)
- `created_at`, `updated_at` (timestamptz)

Enable **RLS**: a user can read/update only their own profile; everyone authenticated can read the public-facing player-pool fields. Add an `updated_at` trigger.

**Stub for later (create as commented DDL / TODO, do not finalize):** `teams`, `team_members`, `seasons`, `matches`, `player_stats`, `draft_picks`. We'll define these when I bring the Season 4 structure.

Seed the **historical stats** from Appendix A (see §8 for how they're used).

---

## 6. Authenticated dashboard + navigation pages

### Post-auth dashboard
After registration, land the user on a **clean, amazing-looking dashboard** that matches the landing page. It should greet them by Discord name, show their avatar, surface their stored ranks, confirm they're in the Season 4 player pool, and point them to the Discord. This is the emotional payoff of signing up — make it feel premium.

### Build every nav page for real
For each item in the landing page's top navigation, build an actual, **beautifully designed route** matching the aesthetic. Where content depends on the not-yet-finalized structure, show a polished **placeholder state** (not a blank page): on-brand hero, a short line explaining the content arrives once the draft begins, and a CTA back to Discord/dashboard. Do not ship lorem ipsum or unstyled stubs.

### Draft page (give it extra love)
The **Draft** page should be more fleshed out than the other placeholders:
- Large, on-brand "**Draft — TBA**" hero.
- Explain the format: a **live-streamed draft** where **captains pick their teams**; exact date/structure to be announced.
- Tell users what to do to be ready: complete registration, confirm ranks, join the Discord, watch for announcements.
- Reserve clearly-labeled space for the future **player pool board** and **live draft board** so we can drop them in later.

---

## 7. Discord integration

The Discord server is wired into the site as a data source and comms channel:

- **Clips & Highlights section** (exists on the landing page): pull this content **from the Discord server** (e.g. a designated clips/highlights channel) and render it in the landing page's existing section, on-brand. Use the Discord API server-side; cache via TanStack Query. Store any bot token / server (guild) id as server-side secrets only.
- **Messaging:** lay the groundwork to **send messages/DMs to users and captains** from the platform once the tournament structure exists (announcements, matchups, draft alerts). Build a small server-side Discord client wrapper now; full messaging flows come later.
- Link the **`https://discord.gg/6KAYkCkzJH`** invite prominently where it makes sense (dashboard, draft page, placeholders).

---

## 8. Landing page data to populate now

### 8a. Player stats — USE THE DATA IN APPENDIX A
The landing page has a **player stats** section. Populate it from the **Season 3 final regular-season stats** in **Appendix A** of this document. Seed them into Supabase (a `historical_player_stats` table is fine) or ship as static JSON in the repo, then render in the existing stats section **matching the design**. Support viewing by **conference** (Sombrero / Fedora) and by **stat category** (Goals, Assists, Saves, Demos, Deleted). These are historical showcase numbers from last season — label them as Season 3 so they aren't confused with live Season 4 data.

### 8b. Final standings — from Challonge
Populate the **final standings** section from these Challonge brackets. Fetch via the Challonge API (or embed) and render on-brand:

- Sombrero Conference: `https://challonge.com/9xmo6e8m`
- Fedora Conference: `https://challonge.com/lqef5imq`
- Play-In — Fedora: `https://challonge.com/xgd9vft0`
- Play-In — Sombrero: `https://challonge.com/75pozbo0`
- Fedora Conference Playoffs: `https://challonge.com/ndtn6xnl`
- Sombrero Conference Playoffs: `https://challonge.com/3mwd784l`

### 8c. Rules page — use Appendix C
Build the **Rules** page from the Season 3 rules in **Appendix C**, styled on-brand. Add a clear banner that rules are being **updated for Season 4** and that TBA fields will be filled in. (We will overhaul these; this is a placeholder with real content.)

### 8d. Live game stats (future)
For Season 4, per-player stats will come from the **ballchasing.com API** once the structure is set. Stub a `getBallchasingStats()` service and a `player_stats` table (commented), but do not build the full pipeline yet.

---

## 9. Out of scope for now (do NOT build yet)
- Team/draft data model finalization, draft logic, live draft board behavior.
- Season 4 schedule, matchups, live standings.
- ballchasing.com ingestion pipeline.
- Full Discord messaging automation.

Leave clean, clearly-labeled seams (interfaces, stubbed tables, reserved UI regions) so these slot in without refactoring.

## 10. What I'll bring back to you next
- Final Season 4 league structure (conferences, team count, roster size, schedule).
- Draft date + format details.
- Updated Season 4 rules.
- Confirmation on the automated tracker-rank approach (which adapter to finish).

## 11. Definition of done for this build
- [ ] Landing page design fetched, README read, `The Hat League.html` implemented; tokens centralized.
- [ ] Discord OAuth via Supabase working end to end.
- [ ] Registration flow captures tracker URL + 2v2/3v3/peak ranks (manual adapter live, automated adapter stubbed).
- [ ] `profiles` table provisioned via Supabase MCP with RLS; users land in the player pool.
- [ ] Gorgeous post-auth dashboard matching the landing aesthetic.
- [ ] Every nav route built and on-brand; placeholders are polished, never blank.
- [ ] Draft page fleshed out with TBA messaging + reserved future regions.
- [ ] Discord clips/highlights pulled into the landing section; messaging wrapper stubbed.
- [ ] Player stats (Appendix A) seeded + rendered by conference/category.
- [ ] Standings (Challonge) rendered on-brand.
- [ ] Rules page (Appendix C) built with Season 4 update banner.
- [ ] Zero `useEffect` (or each justified in-comment); all server state via TanStack Query; all local state via Zustand.

---

## Appendix A — Season 3 final regular-season player stats (seed data)

> Categories: `goals`, `assists`, `saves`, `demos`, `deleted`. Render by conference and category in the landing page stats section. Label as **Season 3**.

```json
{
  "season": 3,
  "scope": "regular_season_final",
  "players": [
    { "name": "OZ", "conference": "Sombrero", "goals": 89, "assists": 24, "saves": 70, "demos": 52, "deleted": 44 },
    { "name": "Jaridox", "conference": "Sombrero", "goals": 71, "assists": 25, "saves": 64, "demos": 18, "deleted": 43 },
    { "name": "Honjo_Kaede", "conference": "Sombrero", "goals": 51, "assists": 19, "saves": 54, "demos": 31, "deleted": 27 },
    { "name": "dbryantm", "conference": "Sombrero", "goals": 49, "assists": 21, "saves": 40, "demos": 19, "deleted": 34 },
    { "name": "Inertiä", "conference": "Sombrero", "goals": 48, "assists": 14, "saves": 90, "demos": 69, "deleted": 41 },
    { "name": "QS3V3N", "conference": "Sombrero", "goals": 48, "assists": 19, "saves": 89, "demos": 78, "deleted": 49 },
    { "name": "Rome Legion X", "conference": "Sombrero", "goals": 47, "assists": 21, "saves": 58, "demos": 39, "deleted": 40 },
    { "name": "Doc Spaceman", "conference": "Sombrero", "goals": 38, "assists": 39, "saves": 36, "demos": 87, "deleted": 24 },
    { "name": "SchizzzRL", "conference": "Sombrero", "goals": 38, "assists": 18, "saves": 52, "demos": 21, "deleted": 31 },
    { "name": "CrazyDazzler", "conference": "Sombrero", "goals": 37, "assists": 27, "saves": 46, "demos": 32, "deleted": 28 },
    { "name": "Citrus", "conference": "Sombrero", "goals": 33, "assists": 5, "saves": 50, "demos": 11, "deleted": 35 },
    { "name": "Spac3OG", "conference": "Sombrero", "goals": 32, "assists": 14, "saves": 53, "demos": 14, "deleted": 25 },
    { "name": "Undying_Breath", "conference": "Sombrero", "goals": 32, "assists": 47, "saves": 66, "demos": 26, "deleted": 43 },
    { "name": "BophadesNutz", "conference": "Sombrero", "goals": 30, "assists": 25, "saves": 34, "demos": 12, "deleted": 20 },
    { "name": "Snowflake_014", "conference": "Sombrero", "goals": 30, "assists": 28, "saves": 45, "demos": 19, "deleted": 29 },
    { "name": "TheGr8Ginger", "conference": "Sombrero", "goals": 24, "assists": 18, "saves": 23, "demos": 18, "deleted": 23 },
    { "name": "iGotAverageMeat", "conference": "Sombrero", "goals": 23, "assists": 18, "saves": 50, "demos": 18, "deleted": 39 },
    { "name": "Jimmy_Numerics", "conference": "Sombrero", "goals": 22, "assists": 15, "saves": 28, "demos": 64, "deleted": 38 },
    { "name": "AlohaVikes", "conference": "Sombrero", "goals": 21, "assists": 23, "saves": 39, "demos": 29, "deleted": 25 },
    { "name": "CrispySprite", "conference": "Sombrero", "goals": 21, "assists": 22, "saves": 34, "demos": 33, "deleted": 25 },
    { "name": "FULLBL00DN8V", "conference": "Sombrero", "goals": 21, "assists": 18, "saves": 24, "demos": 11, "deleted": 26 },
    { "name": "YubinYankinov", "conference": "Sombrero", "goals": 20, "assists": 17, "saves": 32, "demos": 16, "deleted": 23 },
    { "name": "James16D9", "conference": "Sombrero", "goals": 18, "assists": 14, "saves": 36, "demos": 33, "deleted": 29 },
    { "name": "VEAZY_11B", "conference": "Sombrero", "goals": 16, "assists": 19, "saves": 30, "demos": 20, "deleted": 22 },
    { "name": "samoanthrax", "conference": "Sombrero", "goals": 13, "assists": 13, "saves": 30, "demos": 41, "deleted": 19 },
    { "name": "FithAce", "conference": "Sombrero", "goals": 12, "assists": 4, "saves": 30, "demos": 19, "deleted": 31 },
    { "name": "Snorlax_RL", "conference": "Sombrero", "goals": 12, "assists": 7, "saves": 12, "demos": 22, "deleted": 10 },
    { "name": "tomlit", "conference": "Sombrero", "goals": 10, "assists": 2, "saves": 11, "demos": 4, "deleted": 7 },
    { "name": "RogerDaleJunior", "conference": "Sombrero", "goals": 6, "assists": 15, "saves": 17, "demos": 23, "deleted": 32 },
    { "name": "WONKA FLONKA", "conference": "Sombrero", "goals": 5, "assists": 4, "saves": 11, "demos": 12, "deleted": 17 },
    { "name": "Cuppyyyy", "conference": "Fedora", "goals": 83, "assists": 29, "saves": 73, "demos": 26, "deleted": 38 },
    { "name": "McItaly", "conference": "Fedora", "goals": 54, "assists": 24, "saves": 68, "demos": 53, "deleted": 36 },
    { "name": "Boscosmodernlife", "conference": "Fedora", "goals": 53, "assists": 22, "saves": 42, "demos": 37, "deleted": 59 },
    { "name": "Hat_Dad_Gaming", "conference": "Fedora", "goals": 53, "assists": 25, "saves": 86, "demos": 50, "deleted": 53 },
    { "name": "Groovin Yeti", "conference": "Fedora", "goals": 48, "assists": 25, "saves": 62, "demos": 66, "deleted": 41 },
    { "name": "TheProfFREAK", "conference": "Fedora", "goals": 48, "assists": 34, "saves": 68, "demos": 52, "deleted": 54 },
    { "name": "TheSorrySniper", "conference": "Fedora", "goals": 47, "assists": 16, "saves": 109, "demos": 30, "deleted": 52 },
    { "name": "XeroChance222", "conference": "Fedora", "goals": 44, "assists": 13, "saves": 76, "demos": 38, "deleted": 39 },
    { "name": "Grandejuevos45", "conference": "Fedora", "goals": 43, "assists": 24, "saves": 72, "demos": 40, "deleted": 38 },
    { "name": "syski11a", "conference": "Fedora", "goals": 42, "assists": 18, "saves": 55, "demos": 33, "deleted": 22 },
    { "name": "Edgep1ay", "conference": "Fedora", "goals": 39, "assists": 31, "saves": 49, "demos": 28, "deleted": 48 },
    { "name": "Dark0bra", "conference": "Fedora", "goals": 37, "assists": 29, "saves": 31, "demos": 34, "deleted": 46 },
    { "name": "Schobzero", "conference": "Fedora", "goals": 37, "assists": 22, "saves": 38, "demos": 18, "deleted": 35 },
    { "name": "Ulish6", "conference": "Fedora", "goals": 36, "assists": 16, "saves": 34, "demos": 47, "deleted": 34 },
    { "name": "King_of_Failure", "conference": "Fedora", "goals": 35, "assists": 21, "saves": 52, "demos": 25, "deleted": 37 },
    { "name": "MajorMalnut", "conference": "Fedora", "goals": 32, "assists": 27, "saves": 70, "demos": 39, "deleted": 39 },
    { "name": "JackieThrobinson", "conference": "Fedora", "goals": 31, "assists": 17, "saves": 34, "demos": 21, "deleted": 30 },
    { "name": "Phantomloaf", "conference": "Fedora", "goals": 30, "assists": 22, "saves": 82, "demos": 31, "deleted": 33 },
    { "name": "SHOrdr", "conference": "Fedora", "goals": 28, "assists": 21, "saves": 45, "demos": 24, "deleted": 20 },
    { "name": "PeltDidItAgain1", "conference": "Fedora", "goals": 27, "assists": 26, "saves": 46, "demos": 17, "deleted": 31 },
    { "name": "LessthanDan6285", "conference": "Fedora", "goals": 22, "assists": 19, "saves": 33, "demos": 39, "deleted": 31 },
    { "name": "Wa1rus91", "conference": "Fedora", "goals": 22, "assists": 13, "saves": 45, "demos": 49, "deleted": 33 },
    { "name": "zbatdad", "conference": "Fedora", "goals": 22, "assists": 21, "saves": 23, "demos": 76, "deleted": 48 },
    { "name": "Solid_Liquid83", "conference": "Fedora", "goals": 21, "assists": 16, "saves": 50, "demos": 37, "deleted": 35 },
    { "name": "Chr1sTheScrub01", "conference": "Fedora", "goals": 18, "assists": 26, "saves": 30, "demos": 32, "deleted": 47 },
    { "name": "ProdigyMETA", "conference": "Fedora", "goals": 18, "assists": 17, "saves": 54, "demos": 34, "deleted": 39 },
    { "name": "savant_cyclops", "conference": "Fedora", "goals": 18, "assists": 19, "saves": 23, "demos": 25, "deleted": 42 },
    { "name": "AngelImage00", "conference": "Fedora", "goals": 16, "assists": 7, "saves": 33, "demos": 26, "deleted": 39 },
    { "name": "Neoman47", "conference": "Fedora", "goals": 15, "assists": 13, "saves": 45, "demos": 115, "deleted": 24 },
    { "name": "DaScrappyDoo", "conference": "Fedora", "goals": 14, "assists": 4, "saves": 31, "demos": 6, "deleted": 19 }
  ]
}
```

---

## Appendix B — Standings sources (Challonge)
- Sombrero Conference: `https://challonge.com/9xmo6e8m`
- Fedora Conference: `https://challonge.com/lqef5imq`
- Play-In — Fedora: `https://challonge.com/xgd9vft0`
- Play-In — Sombrero: `https://challonge.com/75pozbo0`
- Fedora Conference Playoffs: `https://challonge.com/ndtn6xnl`
- Sombrero Conference Playoffs: `https://challonge.com/3mwd784l`

---

## Appendix C — Season 3 rules (placeholder content for the Rules page; flag as being overhauled for Season 4)

**Regular Season** — 5 weeks. You play 2 opponents each week, and against each opponent you play 5 games (not best-of-5 — 5 games). The Labor Day weekend (where Week 2 would sit) is off. There is no maximum goal differential.

**Playoffs / Play-In** — The top 6 teams in each conference get an automatic berth to the playoffs. Seeds 7–10 play in a double-elimination play-in tournament. Play-In Tourneys: [TBA] CST. The Play-In winner takes the 7 seed; the runner-up takes the 8 seed. Sombrero Conference playoffs: [TBA], 8:30 pm CST. Fedora Conference playoffs: [TBA], 8:00 pm CST. Playoffs are double-elimination, best-of-3 series. Conference Finals are best-of-5 with a reset if needed. Grand Finals between the Fedora and Sombrero conferences: [TBA], 8:00 pm CST, best-of-7.

**Replays** — One person per team is designated to upload replays to ballchasing.com so we can collect stats for every player. Teams should create a folder to track and submit replays.

**Subs / Scheduling** — Subs are an absolute last resort and must be approved before a player fills in. Reschedules during the week are fine if both teams agree. Games are scheduled Friday–Sunday, 9 pm–11 pm EST. Report scheduling issues to [TBA] ASAP.

> **Season 4 note:** these rules are changing significantly. Treat all of the above as placeholder and update once the new structure is provided.
