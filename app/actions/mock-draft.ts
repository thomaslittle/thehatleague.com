"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RL_RANK_TIERS } from "@/lib/data/rocket-league-ranks";
import { sortByDraftValue, type AvailablePlayer } from "@/lib/draft/available";
import { buildSchedule } from "@/lib/tournament/schedule";
import { evaluateMatchAwards, evaluateSeasonAwards } from "@/lib/awards/engine";
import type { Json } from "@/lib/supabase/types";

/**
 * Mock-draft lab. Lets league ops stand up a complete demo league — synthetic
 * pool, captains, teams, a drafted roster, a played season, power rankings and
 * stats — to exercise every surface before the real draft, then tear it all
 * down. All mock rows are isolated to a `mock-*` season + `is_mock` profiles, so
 * `resetMockLeague` removes everything via the DB's cascade graph
 * (`purge_mock_data`). The mock season is created `is_active`, and because it's
 * the newest active season it wins `getActiveSeason()` while it exists — so the
 * public pages render the demo without touching the real season's flags.
 */

export interface MockActionState {
  ok?: boolean;
  error?: string;
  note?: string;
}

type SupabaseServer = Awaited<ReturnType<typeof createSupabaseServerClient>>;

const MOCK_SLUG = "mock-season";
const MOCK_NAME = "Mock Season (Demo)";
const TEAM_COLORS = ["#f76103", "#60a5fa", "#4ade80", "#f472b6", "#a78bfa", "#facc15", "#fb7185", "#34d399"];

async function leagueOps(): Promise<
  { ok: true; supabase: SupabaseServer; userId: string } | { ok: false; error: string }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You need to sign in." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return { ok: false, error: "League ops only." };
  return { ok: true, supabase, userId: user.id };
}

// Deterministic-ish synthetic identities. Math.random is fine in a server
// action (only Workflow scripts forbid it).
const FIRST = ["Turbo", "Boost", "Aerial", "Flip", "Demo", "Clutch", "Whiff", "Pinch", "Ceiling", "Corner", "Top", "Half", "Power", "Musty", "Wave", "Air", "Speed", "Stall", "Nose", "Ground"];
const LAST = ["Fennec", "Octane", "Dominus", "Goblin", "Hatter", "Baron", "Dad", "Smurf", "Wizard", "Captain", "Rookie", "Veteran", "Legend", "Menace", "Maestro", "Bandit", "Cyclone", "Comet", "Rascal", "Phantom"];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface MockPlayer {
  name: string;
  username: string;
  avatar: string;
  peak: string;
  r3: string;
  r2: string;
  captain: boolean;
  tracker: string;
}

function generateMockPlayers(count: number, captains: number): MockPlayer[] {
  const used = new Set<string>();
  // Bias ranks toward Diamond–GC so the demo looks like the real adult league.
  const pool = RL_RANK_TIERS.slice(10, 23); // Platinum I .. Supersonic Legend
  const out: MockPlayer[] = [];
  for (let i = 0; i < count; i += 1) {
    let name = `${pick(FIRST)} ${pick(LAST)}`;
    let n = 2;
    const base = name;
    while (used.has(name)) {
      name = `${base} ${n}`;
      n += 1;
    }
    used.add(name);
    const username = name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const peakIdx = Math.min(pool.length - 1, Math.floor(Math.random() * pool.length));
    const peak = pool[peakIdx];
    const r3 = pool[Math.max(0, peakIdx - Math.floor(Math.random() * 2))];
    const r2 = pool[Math.max(0, peakIdx - Math.floor(Math.random() * 3))];
    out.push({
      name,
      username,
      avatar: `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(username)}`,
      peak,
      r3,
      r2,
      captain: i < captains,
      tracker: "https://rocketleague.tracker.network/",
    });
  }
  return out;
}

async function getMockSeasonId(supabase: SupabaseServer): Promise<string | null> {
  const { data } = await supabase.from("seasons").select("id").eq("slug", MOCK_SLUG).maybeSingle();
  return data?.id ?? null;
}

/**
 * Stand up the mock pool + captains + teams + seeded draft order, ready to run.
 * Idempotent-ish: refuses if a mock season already exists (reset first).
 */
export async function seedMockLeague(
  opts: { players?: number; captains?: number; rosterSize?: number; pickSeconds?: number } = {},
): Promise<MockActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  if (await getMockSeasonId(supabase)) {
    return { error: "A mock season already exists — reset it first." };
  }

  const playerCount = Math.min(60, Math.max(8, opts.players ?? 30));
  const captainCount = Math.min(8, Math.max(2, opts.captains ?? 6));
  const rosterSize = Math.max(2, opts.rosterSize ?? 3);
  const pickSeconds = Math.max(10, opts.pickSeconds ?? 30);

  // 1) Mock season — NOT globally active. It stays a `mock-*` season; only
  // admins are routed to it (getActiveSeason is viewer-aware), so the public
  // keeps seeing the real active season. The real Season 4 is never touched.
  const { data: season, error: seasonErr } = await supabase
    .from("seasons")
    .insert({
      name: MOCK_NAME,
      slug: MOCK_SLUG,
      status: "draft",
      is_active: false,
      draft_settings: {
        roster_size: rosterSize,
        captain_is_roster_slot: true,
        pick_seconds: pickSeconds,
        type: "snake",
        seed_method: "rank_asc",
      },
    })
    .select("id, conferences")
    .single();
  if (seasonErr || !season) return { error: seasonErr?.message ?? "Could not create mock season." };

  // 2) Synthetic players via the SECURITY DEFINER seeder (creates auth users +
  // profiles, flags is_mock + in_player_pool).
  const players = generateMockPlayers(playerCount, captainCount);
  const { error: seedErr } = await supabase.rpc("seed_mock_players", {
    p_players: players as unknown as Json,
  });
  if (seedErr) return { error: `Seeding players failed: ${seedErr.message}` };

  // 3) Teams from the mock captains, alternating conference + colored.
  const { data: mockCaptains } = await supabase
    .from("profiles")
    .select("id, discord_global_name, peak_rank, created_at")
    .eq("is_mock", true)
    .eq("is_captain", true);
  const conferences = season.conferences?.length ? season.conferences : ["Sombrero", "Fedora"];
  const teamIds: string[] = [];
  let ci = 0;
  for (const cap of mockCaptains ?? []) {
    const name = cap.discord_global_name ?? "Squad";
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-mock`.slice(0, 50);
    const { data: team, error: teamErr } = await supabase
      .from("teams")
      .insert({
        season_id: season.id,
        name: `${name}'s Squad`,
        slug,
        captain_id: cap.id,
        conference: conferences[ci % conferences.length],
        color: TEAM_COLORS[ci % TEAM_COLORS.length],
      })
      .select("id")
      .single();
    if (teamErr || !team) return { error: teamErr?.message ?? "Team create failed." };
    await supabase.from("team_members").insert({
      team_id: team.id,
      profile_id: cap.id,
      season_id: season.id,
      is_captain: true,
    });
    teamIds.push(team.id);
    ci += 1;
  }

  // Captaincy now lives in teams.captain_id + team_members; clear the public
  // profiles.is_captain flag on mock players so they never surface on the
  // /captains page (defense-in-depth, independent of app-code filters).
  await supabase.from("profiles").update({ is_captain: false }).eq("is_mock", true);

  // 4) Seed the draft order by captain rank (balance) + mirror draft_position.
  const ordered = [...(mockCaptains ?? [])]
    .map((c, idx) => ({ teamId: teamIds[idx], peak: c.peak_rank, created: c.created_at }))
    .sort((a, b) => {
      const wa = RL_RANK_TIERS.indexOf((a.peak ?? "Unranked") as (typeof RL_RANK_TIERS)[number]);
      const wb = RL_RANK_TIERS.indexOf((b.peak ?? "Unranked") as (typeof RL_RANK_TIERS)[number]);
      return wa - wb;
    })
    .map((x) => x.teamId);

  const orderRows = ordered.map((teamId, i) => ({ season_id: season.id, position: i + 1, team_id: teamId }));
  await supabase.from("draft_order").insert(orderRows);
  for (let i = 0; i < ordered.length; i += 1) {
    await supabase.from("teams").update({ draft_position: i + 1 }).eq("id", ordered[i]);
  }

  // 5) Draft state in setup + overlay settings.
  await supabase.from("draft_state").upsert({ season_id: season.id, status: "setup" }, { onConflict: "season_id" });
  await supabase.from("overlay_settings").upsert({ season_id: season.id }, { onConflict: "season_id" });

  revalidatePath("/admin/draft");
  revalidatePath("/the-draft");
  revalidatePath("/pool");
  return { ok: true, note: `Seeded ${playerCount} players, ${teamIds.length} teams.` };
}

/**
 * Auto-run the mock draft to completion (best-available, only mock players),
 * exercising the live board + reveal. Starts the draft if it's still in setup.
 */
export async function runMockDraft(): Promise<MockActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const seasonId = await getMockSeasonId(supabase);
  if (!seasonId) return { error: "No mock season — seed one first." };

  // Settings → picks per team.
  const { data: seasonRow } = await supabase
    .from("seasons")
    .select("draft_settings")
    .eq("id", seasonId)
    .single();
  const ds = (seasonRow?.draft_settings ?? {}) as { roster_size?: number; captain_is_roster_slot?: boolean };
  const rosterSize = Number(ds.roster_size) > 0 ? Number(ds.roster_size) : 3;
  const perTeam = Math.max(0, rosterSize - (ds.captain_is_roster_slot === false ? 0 : 1));

  const { data: order } = await supabase
    .from("draft_order")
    .select("team_id, position")
    .eq("season_id", seasonId)
    .order("position", { ascending: true });
  if (!order?.length) return { error: "No draft order — seed first." };

  // The mock auto-run always drafts a complete board from scratch — there's no
  // "resume" case. Unconditionally clear any prior picks/rosters and (re)start
  // the state cleanly so overall_pick restarts at 1 and never collides on its
  // (season_id, overall_pick) unique key. This also repairs a draft left in an
  // inconsistent state by an earlier interrupted run. Captains (is_captain=true)
  // are roster slots and stay; only drafted players are cleared.
  await supabase.from("draft_picks").delete().eq("season_id", seasonId);
  await supabase
    .from("team_members")
    .delete()
    .eq("season_id", seasonId)
    .eq("is_captain", false);
  await supabase.from("draft_state").upsert(
    {
      season_id: seasonId,
      status: "live",
      current_overall_pick: 1,
      current_round: 1,
      on_clock_team_id: order[0].team_id,
      pick_ends_at: new Date(Date.now() + 30_000).toISOString(),
      is_paused: false,
      paused_remaining_ms: null,
      last_pick_id: null,
    },
    { onConflict: "season_id" },
  );

  // Available = mock pool minus already-drafted.
  const { data: mockPool } = await supabase
    .from("profiles")
    .select("id, peak_rank, rank_3v3, rank_2v2, created_at")
    .eq("is_mock", true);
  const { data: drafted } = await supabase
    .from("team_members")
    .select("profile_id")
    .eq("season_id", seasonId);
  const draftedIds = new Set((drafted ?? []).map((d) => d.profile_id));

  const remaining = sortByDraftValue(
    (mockPool ?? []).map((p) => ({
      id: p.id,
      peak_rank: p.peak_rank,
      rank_3v3: p.rank_3v3,
      rank_2v2: p.rank_2v2,
      created_at: p.created_at,
    })) as AvailablePlayer[],
  ).filter((p) => !draftedIds.has(p.id));

  const totalPicks = perTeam * order.length;
  let made = 0;
  for (let i = 0; i < totalPicks; i += 1) {
    const next = remaining.shift();
    if (!next) break;
    const { error } = await supabase.rpc("make_draft_pick", {
      p_season: seasonId,
      p_profile: next.id,
      p_auto: true,
    });
    if (error) {
      // Status may have flipped to complete; stop gracefully.
      if (/not live|complete/i.test(error.message)) break;
      return { error: `Pick ${i + 1} failed: ${error.message}` };
    }
    made += 1;
  }

  revalidatePath("/the-draft");
  revalidatePath("/admin/draft");
  return { ok: true, note: `Auto-drafted ${made} picks.` };
}

/**
 * Generate a schedule, play it out with random results + per-player stats, and
 * publish week-1 power rankings — so standings, schedule, leaderboards, team
 * pages and profiles all populate with believable demo data.
 */
export async function simulateSeasonResults(): Promise<MockActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const seasonId = await getMockSeasonId(supabase);
  if (!seasonId) return { error: "No mock season — seed one first." };

  const { data: teams } = await supabase
    .from("teams")
    .select("id, conference")
    .eq("season_id", seasonId);
  if (!teams || teams.length < 2) return { error: "Need at least two teams." };

  // Rosters for per-player stats.
  const { data: members } = await supabase
    .from("team_members")
    .select("team_id, profile_id")
    .eq("season_id", seasonId);
  const rosterByTeam = new Map<string, string[]>();
  for (const m of members ?? []) {
    if (!rosterByTeam.has(m.team_id)) rosterByTeam.set(m.team_id, []);
    rosterByTeam.get(m.team_id)!.push(m.profile_id);
  }

  // Fresh schedule (clear any existing mock matches).
  await supabase.from("matches").delete().eq("season_id", seasonId);
  const byConf = new Map<string, string[]>();
  for (const t of teams) {
    const k = t.conference ?? "League";
    if (!byConf.has(k)) byConf.set(k, []);
    byConf.get(k)!.push(t.id);
  }

  let played = 0;
  for (const [conf, ids] of byConf) {
    const pairings = buildSchedule(ids, 1);
    for (const p of pairings) {
      const homeWins = Math.random() < 0.5;
      const winnerGames = 3;
      const loserGames = Math.floor(Math.random() * 3); // 0–2
      const homeScore = homeWins ? winnerGames : loserGames;
      const awayScore = homeWins ? loserGames : winnerGames;
      const { data: match } = await supabase
        .from("matches")
        .insert({
          season_id: seasonId,
          week: p.week,
          conference: conf === "League" ? null : conf,
          home_team_id: p.homeId,
          away_team_id: p.awayId,
          status: "final",
          home_score: homeScore,
          away_score: awayScore,
          best_of: 5,
          winner_team_id: homeWins ? p.homeId : p.awayId,
          scheduled_at: new Date(Date.now() - (5 - p.week) * 7 * 86_400_000).toISOString(),
        })
        .select("id")
        .single();
      if (!match) continue;
      played += 1;

      // Per-game rows.
      const games = homeScore + awayScore;
      const gameRows = Array.from({ length: Math.max(games, 1) }, (_, gi) => ({
        match_id: match.id,
        game_number: gi + 1,
        home_goals: Math.floor(Math.random() * 5),
        away_goals: Math.floor(Math.random() * 5),
      }));
      await supabase.from("match_games").insert(gameRows);

      // Per-player stats for both rosters.
      const statRows: {
        season_id: string;
        match_id: string;
        profile_id: string;
        goals: number;
        assists: number;
        saves: number;
        demos: number;
        score: number;
      }[] = [];
      for (const teamId of [p.homeId, p.awayId]) {
        for (const pid of rosterByTeam.get(teamId) ?? []) {
          const goals = Math.floor(Math.random() * 6);
          const assists = Math.floor(Math.random() * 4);
          const saves = Math.floor(Math.random() * 5);
          const demos = Math.floor(Math.random() * 4);
          statRows.push({
            season_id: seasonId,
            match_id: match.id,
            profile_id: pid,
            goals,
            assists,
            saves,
            demos,
            score: goals * 100 + assists * 50 + saves * 50 + demos * 20 + 100,
          });
        }
      }
      if (statRows.length) await supabase.from("player_stats").insert(statRows);

      // Points + performance badges for this match.
      await evaluateMatchAwards(supabase, match.id);
    }
  }

  // Season-wide badges (drafted, sharpshooter) + crown the champion.
  await evaluateSeasonAwards(supabase, seasonId, { crownChampion: true });

  // Week-1 power rankings off the standings.
  const { data: standings } = await supabase
    .from("standings_view")
    .select("team_id, w, diff")
    .eq("season_id", seasonId);
  const ranked = [...(standings ?? [])].sort(
    (a, b) => Number(b.w ?? 0) - Number(a.w ?? 0) || Number(b.diff ?? 0) - Number(a.diff ?? 0),
  );
  await supabase.from("power_rankings").delete().eq("season_id", seasonId);
  const prRows = ranked
    .map((r, i) =>
      r.team_id
        ? {
            season_id: seasonId,
            week: 1,
            team_id: r.team_id,
            rank: i + 1,
            previous_rank: null,
            blurb: i === 0 ? "Setting the early pace." : "In the hunt.",
          }
        : null,
    )
    .filter((x): x is NonNullable<typeof x> => x !== null);
  if (prRows.length) await supabase.from("power_rankings").insert(prRows);

  revalidatePath("/schedule");
  revalidatePath("/standings");
  revalidatePath("/leaderboards");
  return { ok: true, note: `Played ${played} matches; stats + power rankings generated.` };
}

/** Run the whole demo end-to-end. */
export async function buildFullMockLeague(
  opts: { players?: number; captains?: number; rosterSize?: number; pickSeconds?: number } = {},
): Promise<MockActionState> {
  const seed = await seedMockLeague(opts);
  if (seed.error) return seed;
  const draft = await runMockDraft();
  if (draft.error) return draft;
  const sim = await simulateSeasonResults();
  if (sim.error) return sim;
  return { ok: true, note: "Full mock league built: pool → draft → season." };
}

/** Tear down every mock row (season cascade + mock auth users). */
export async function resetMockLeague(): Promise<MockActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const { error } = await supabase.rpc("purge_mock_data");
  if (error) return { error: error.message };

  revalidatePath("/admin/draft");
  revalidatePath("/the-draft");
  revalidatePath("/pool");
  revalidatePath("/standings");
  revalidatePath("/schedule");
  revalidatePath("/leaderboards");
  return { ok: true, note: "Mock league removed." };
}
