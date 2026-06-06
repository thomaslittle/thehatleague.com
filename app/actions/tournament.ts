"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildSchedule } from "@/lib/tournament/schedule";
import { evaluateMatchAwards } from "@/lib/awards/engine";

/**
 * Tournament actions: schedule generation (league-ops) and result reporting
 * (involved captains OR league-ops). The `standings_view` recomputes from
 * `matches` automatically, so reporting a result is all it takes to move the
 * table.
 */

export interface TournamentActionState {
  ok?: boolean;
  error?: string;
  created?: number;
}

type SupabaseServer = Awaited<ReturnType<typeof createSupabaseServerClient>>;

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

/**
 * Generate a round-robin schedule per conference (or whole league if teams have
 * no conference). Guards against clobbering: refuses if non-scheduled (in-progress
 * or final) matches already exist unless `force`. Removes existing *scheduled*
 * matches first so it's regenerable.
 */
export async function generateSchedule(
  seasonId: string,
  opts: { legs?: 1 | 2; force?: boolean } = {},
): Promise<TournamentActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;
  const legs = opts.legs ?? 1;

  const { data: existing } = await supabase
    .from("matches")
    .select("id, status")
    .eq("season_id", seasonId);
  const played = (existing ?? []).filter((m) => m.status !== "scheduled");
  if (played.length > 0 && !opts.force) {
    return { error: `${played.length} match(es) already in progress/final — pass force to overwrite.` };
  }

  // Clear only scheduled matches (preserve played history unless forcing).
  let del = supabase.from("matches").delete().eq("season_id", seasonId);
  if (!opts.force) del = del.eq("status", "scheduled");
  const { error: delErr } = await del;
  if (delErr) return { error: delErr.message };

  const { data: teams } = await supabase
    .from("teams")
    .select("id, conference")
    .eq("season_id", seasonId);
  if (!teams?.length) return { error: "No teams to schedule." };

  // Group by conference (null → single "league" group).
  const groups = new Map<string, string[]>();
  for (const t of teams) {
    const key = t.conference ?? "__league__";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t.id);
  }

  const rows: {
    season_id: string;
    week: number;
    conference: string | null;
    home_team_id: string;
    away_team_id: string;
  }[] = [];
  for (const [conf, ids] of groups) {
    const pairings = buildSchedule(ids, legs);
    for (const p of pairings) {
      rows.push({
        season_id: seasonId,
        week: p.week,
        conference: conf === "__league__" ? null : conf,
        home_team_id: p.homeId,
        away_team_id: p.awayId,
      });
    }
  }
  if (!rows.length) return { error: "Not enough teams to pair." };

  const { error: insErr } = await supabase.from("matches").insert(rows);
  if (insErr) return { error: insErr.message };

  revalidatePath("/schedule");
  revalidatePath("/standings");
  return { ok: true, created: rows.length };
}

/**
 * Submit (or change) a prediction for a match. Any signed-in player. Upserts on
 * (match_id, profile_id) so a player has one live prediction per match.
 */
export async function submitPrediction(
  matchId: string,
  winnerTeamId: string,
): Promise<TournamentActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to predict." };

  const { error } = await supabase
    .from("match_predictions")
    .upsert(
      { match_id: matchId, profile_id: user.id, predicted_winner_team_id: winnerTeamId },
      { onConflict: "match_id,profile_id" },
    );
  if (error) return { error: error.message };

  revalidatePath(`/matches/${matchId}`);
  return { ok: true };
}

/**
 * Cast (or change) an MVP vote for a player in a match. One vote per voter per
 * match. Re-evaluates the match so the MVP badge follows the leader. Any
 * signed-in player.
 */
export async function castMvpVote(matchId: string, profileId: string): Promise<TournamentActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to vote." };

  const { error } = await supabase
    .from("mvp_votes")
    .upsert(
      { match_id: matchId, voter_id: user.id, profile_id: profileId },
      { onConflict: "match_id,voter_id" },
    );
  if (error) return { error: error.message };

  await evaluateMatchAwards(supabase, matchId);
  revalidatePath(`/matches/${matchId}`);
  return { ok: true };
}

/** Set / reschedule a match time. Involved captains or league ops (RLS-gated). */
export async function setMatchSchedule(
  matchId: string,
  scheduledAt: string | null,
): Promise<TournamentActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in." };

  const { error } = await supabase
    .from("matches")
    .update({ scheduled_at: scheduledAt })
    .eq("id", matchId);
  if (error) return { error: error.message };

  revalidatePath("/schedule");
  revalidatePath(`/matches/${matchId}`);
  return { ok: true };
}

/**
 * Report a final result. Sets the series score, winner, status=final, and
 * optionally records per-game goals. Involved captains or league ops (RLS).
 */
export async function reportMatchResult(input: {
  matchId: string;
  homeScore: number;
  awayScore: number;
  games?: { home_goals: number; away_goals: number }[];
}): Promise<TournamentActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in." };

  const { data: match } = await supabase
    .from("matches")
    .select("id, home_team_id, away_team_id")
    .eq("id", input.matchId)
    .maybeSingle();
  if (!match) return { error: "Match not found." };
  if (input.homeScore === input.awayScore) {
    return { error: "A series can't end tied." };
  }

  const winner = input.homeScore > input.awayScore ? match.home_team_id : match.away_team_id;
  const { error } = await supabase
    .from("matches")
    .update({
      home_score: input.homeScore,
      away_score: input.awayScore,
      winner_team_id: winner,
      status: "final",
    })
    .eq("id", input.matchId);
  if (error) return { error: error.message };

  if (input.games?.length) {
    // Replace any existing game rows for an idempotent re-report.
    await supabase.from("match_games").delete().eq("match_id", input.matchId);
    const gameRows = input.games.map((g, i) => ({
      match_id: input.matchId,
      game_number: i + 1,
      home_goals: g.home_goals,
      away_goals: g.away_goals,
    }));
    const { error: gErr } = await supabase.from("match_games").insert(gameRows);
    if (gErr) return { error: gErr.message };
  }

  // Award participation/result/stat points + performance badges (idempotent).
  await evaluateMatchAwards(supabase, input.matchId);

  revalidatePath("/schedule");
  revalidatePath("/standings");
  revalidatePath("/leaderboards");
  revalidatePath(`/matches/${input.matchId}`);
  return { ok: true };
}

/**
 * Publish a power-ranking week. With no explicit order, auto-suggests from the
 * standings (wins, then goal diff). `previous_rank` is carried from the latest
 * existing week so the page can show movement arrows. League-ops only.
 */
export async function publishPowerRankings(
  seasonId: string,
  opts: { week?: number; order?: { teamId: string; blurb?: string }[] } = {},
): Promise<TournamentActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const { data: prevWeekRow } = await supabase
    .from("power_rankings")
    .select("week")
    .eq("season_id", seasonId)
    .order("week", { ascending: false })
    .limit(1)
    .maybeSingle();
  const prevWeek = prevWeekRow?.week ?? null;
  const prevRankByTeam = new Map<string, number>();
  if (prevWeek != null) {
    const { data: prevRows } = await supabase
      .from("power_rankings")
      .select("team_id, rank")
      .eq("season_id", seasonId)
      .eq("week", prevWeek);
    for (const r of prevRows ?? []) prevRankByTeam.set(r.team_id, r.rank);
  }
  const week = opts.week ?? (prevWeek ?? 0) + 1;

  let order = opts.order;
  if (!order?.length) {
    const { data: standings } = await supabase
      .from("standings_view")
      .select("team_id, w, diff, gf")
      .eq("season_id", seasonId);
    order = [...(standings ?? [])]
      .sort(
        (a, b) =>
          Number(b.w ?? 0) - Number(a.w ?? 0) ||
          Number(b.diff ?? 0) - Number(a.diff ?? 0) ||
          Number(b.gf ?? 0) - Number(a.gf ?? 0),
      )
      .map((s) => ({ teamId: s.team_id as string }));
  }
  if (!order.length) return { error: "No teams to rank." };

  await supabase.from("power_rankings").delete().eq("season_id", seasonId).eq("week", week);
  const rows = order.map((o, i) => ({
    season_id: seasonId,
    week,
    team_id: o.teamId,
    rank: i + 1,
    previous_rank: prevRankByTeam.get(o.teamId) ?? null,
    blurb: o.blurb ?? null,
  }));
  const { error } = await supabase.from("power_rankings").insert(rows);
  if (error) return { error: error.message };

  revalidatePath("/power-rankings");
  revalidatePath("/standings");
  return { ok: true, created: rows.length };
}
