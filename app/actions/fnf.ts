"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rankWeight } from "@/lib/data/rank-sort";
import { getFnfState } from "@/lib/data/fnf";
import {
  balancedTeams,
  buildBracket,
  computeStandings,
  orderStandings,
  playedPairs,
  swissPair,
  type FnfMatchLite,
} from "@/lib/fnf/pairing";

export interface FnfActionState {
  ok?: boolean;
  error?: string;
}

const FNF_PATH = "/friday-nite-fights";

/** Sign the current Discord-authenticated user up for the tournament. */
export async function registerForFnf(
  tournamentId: string,
): Promise<FnfActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in with Discord to register." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("rank_2v2, peak_rank")
    .eq("id", user.id)
    .single();

  // Teams are balanced on the player's CURRENT 2v2 rank, falling back to peak
  // only if their current 2v2 rank is missing/unranked.
  const rankValue = profile?.rank_2v2 ?? profile?.peak_rank ?? null;
  let weight = rankWeight(profile?.rank_2v2);
  if (weight <= 0) weight = rankWeight(profile?.peak_rank);

  const { error } = await supabase.from("fnf_registrations").insert({
    tournament_id: tournamentId,
    profile_id: user.id,
    rank_value: rankValue,
    rank_weight: weight,
  });
  if (error && !error.message.includes("duplicate")) {
    return { error: error.message };
  }

  revalidatePath(FNF_PATH);
  return { ok: true };
}

/** Withdraw the current user's registration. */
export async function leaveFnf(tournamentId: string): Promise<FnfActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("fnf_registrations")
    .delete()
    .eq("tournament_id", tournamentId)
    .eq("profile_id", user.id);
  if (error) return { error: error.message };

  revalidatePath(FNF_PATH);
  return { ok: true };
}

/** Admin: update tournament settings (rounds, cut, best-of per stage, start, name). */
export async function updateFnfSettings(
  tournamentId: string,
  settings: {
    name?: string;
    swissRounds?: number;
    swissGames?: number;
    playoffBestOf?: number;
    finalBestOf?: number;
    playoffCut?: number;
    startsAt?: string | null;
  },
): Promise<FnfActionState> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("fnf_upsert_tournament", {
    p_id: tournamentId,
    p_name: settings.name ?? null,
    p_swiss_rounds: settings.swissRounds ?? null,
    p_swiss_games: settings.swissGames ?? null,
    p_playoff_best_of: settings.playoffBestOf ?? null,
    p_final_best_of: settings.finalBestOf ?? null,
    p_playoff_cut: settings.playoffCut ?? null,
    p_starts_at: settings.startsAt ?? null,
  });
  if (error) return { error: error.message };

  revalidatePath(FNF_PATH);
  return { ok: true };
}

/**
 * Admin: undo back to the registration phase. Clears teams and ALL matches
 * (Swiss + playoffs) but keeps every signup, so the organizer can re-generate
 * from scratch if anything looks wrong. Works from any phase.
 */
export async function resetTournament(
  tournamentId: string,
): Promise<FnfActionState> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("fnf_reset", {
    p_tournament: tournamentId,
  });
  if (error) return { error: error.message };

  revalidatePath(FNF_PATH);
  return { ok: true };
}

/** Admin: auto-generate rank-balanced 2v2 teams from the registrations. */
export async function generateTeams(
  tournamentId: string,
): Promise<FnfActionState> {
  const supabase = await createSupabaseServerClient();
  const { data: regs } = await supabase
    .from("fnf_registrations")
    .select("profile_id")
    .eq("tournament_id", tournamentId);

  const ids = (regs ?? []).map((r) => r.profile_id as string);
  if (ids.length < 2) {
    return { error: "Need at least 2 registered players." };
  }

  // Seed from the players' LIVE current 2v2 rank (fallback peak) so any rank
  // updates since registration are reflected in the balancing.
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, rank_2v2, peak_rank")
    .in("id", ids);
  const weightOf = new Map(
    (profiles ?? []).map((p) => {
      let w = rankWeight(p.rank_2v2);
      if (w <= 0) w = rankWeight(p.peak_rank);
      return [p.id, w];
    }),
  );
  const players = ids.map((id) => ({
    id,
    weight: weightOf.get(id) ?? -1,
  }));

  const { teams, bench } = balancedTeams(players);
  const payload = teams.map((profileIds, i) => ({
    seed: i + 1,
    name: `Team ${i + 1}`,
    profile_ids: profileIds,
  }));
  // Park any odd-one-out on a final solo "bench" team the admin can fix.
  if (bench.length > 0) {
    payload.push({
      seed: payload.length + 1,
      name: `Bench`,
      profile_ids: bench,
    });
  }

  const { error } = await supabase.rpc("fnf_generate_teams", {
    p_tournament: tournamentId,
    p_teams: payload,
  });
  if (error) return { error: error.message };

  revalidatePath(FNF_PATH);
  return { ok: true };
}

/** Admin: persist a hand-edited roster layout (drag/drop). */
export async function saveRosters(
  tournamentId: string,
  rosters: { teamId: string; profileIds: string[] }[],
): Promise<FnfActionState> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("fnf_set_rosters", {
    p_tournament: tournamentId,
    p_rosters: rosters.map((r) => ({
      team_id: r.teamId,
      profile_ids: r.profileIds,
    })),
  });
  if (error) return { error: error.message };

  revalidatePath(FNF_PATH);
  return { ok: true };
}

/** Admin: lock the rosters and generate the Swiss round 1 pairings. */
export async function startSwiss(
  tournamentId: string,
): Promise<FnfActionState> {
  const state = await getFnfState(tournamentId);
  if (!state) return { error: "Tournament not found." };
  if (state.teams.length < 2) return { error: "Generate teams first." };

  // Round 1: pair by seed (strongest-balanced teams meet adjacent seeds).
  const ordered = orderStandings(
    computeStandings(
      state.teams.map((t) => ({ id: t.id, seed: t.seed, name: t.name })),
      [],
    ),
  );
  const pairs = swissPair(ordered, new Set());
  const matches = pairs.map((p, i) => ({
    slot: i,
    team_a_id: p.teamA,
    team_b_id: p.teamB ?? "",
    best_of: state.tournament.swissGames,
  }));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("fnf_create_round", {
    p_tournament: tournamentId,
    p_stage: "swiss",
    p_round: 1,
    p_matches: matches,
  });
  if (error) return { error: error.message };

  revalidatePath(FNF_PATH);
  return { ok: true };
}

/**
 * Report a score. Anyone on either team (or an admin) may report. When the
 * report completes the current Swiss round, the next round is paired and
 * created automatically — or the tournament flips to "complete" after the
 * final round.
 */
export async function reportMatch(
  matchId: string,
  scoreA: number,
  scoreB: number,
): Promise<FnfActionState> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("fnf_report_match", {
    p_match: matchId,
    p_score_a: scoreA,
    p_score_b: scoreB,
  });
  if (error) return { error: error.message };

  const res = data as {
    tournament_id: string;
    stage: "swiss" | "playoffs";
    round: number;
    round_complete: boolean;
  };

  if (res.round_complete && res.stage === "swiss") {
    await advanceSwiss(res.tournament_id);
  }

  revalidatePath(FNF_PATH);
  return { ok: true };
}

/** After a Swiss round finishes: pair the next round, or finish the stage. */
async function advanceSwiss(tournamentId: string): Promise<void> {
  const state = await getFnfState(tournamentId);
  if (!state) return;
  const { tournament, teams, matches } = state;

  if (tournament.currentRound >= tournament.swissRounds) {
    const supabase = await createSupabaseServerClient();
    await supabase.rpc("fnf_set_status", {
      p_tournament: tournamentId,
      p_status: "complete",
    });
    return;
  }

  const lites: FnfMatchLite[] = matches.map((m) => ({
    stage: m.stage,
    round: m.round,
    teamAId: m.teamAId,
    teamBId: m.teamBId,
    winnerTeamId: m.winnerTeamId,
    scoreA: m.scoreA,
    scoreB: m.scoreB,
    status: m.status,
  }));
  const ordered = orderStandings(
    computeStandings(
      teams.map((t) => ({ id: t.id, seed: t.seed, name: t.name })),
      lites,
    ),
  );
  const pairs = swissPair(ordered, playedPairs(lites));
  const nextRound = tournament.currentRound + 1;
  const payload = pairs.map((p, i) => ({
    slot: i,
    team_a_id: p.teamA,
    team_b_id: p.teamB ?? "",
    best_of: tournament.swissGames,
  }));

  const supabase = await createSupabaseServerClient();
  await supabase.rpc("fnf_create_round", {
    p_tournament: tournamentId,
    p_stage: "swiss",
    p_round: nextRound,
    p_matches: payload,
  });
}

/** Admin: seed the playoff bracket from the top `playoff_cut` Swiss teams. */
export async function generatePlayoffs(
  tournamentId: string,
): Promise<FnfActionState> {
  const state = await getFnfState(tournamentId);
  if (!state) return { error: "Tournament not found." };

  const cut = Math.min(state.tournament.playoffCut, state.standings.length);
  if (cut < 2) return { error: "Not enough teams for a playoff bracket." };

  const seeds = state.standings.slice(0, cut).map((s) => s.teamId);
  const bracket = buildBracket(seeds, () => crypto.randomUUID());
  // The final is the last round in the bracket — it can run a longer series.
  const finalRound = bracket.reduce((max, m) => Math.max(max, m.round), 0);
  const payload = bracket.map((m) => ({
    id: m.id,
    round: m.round,
    slot: m.slot,
    team_a_id: m.teamAId ?? "",
    team_b_id: m.teamBId ?? "",
    next_match_id: m.nextMatchId ?? "",
    next_slot_is_a: m.nextSlotIsA,
    best_of:
      m.round === finalRound
        ? state.tournament.finalBestOf
        : state.tournament.playoffBestOf,
  }));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("fnf_create_playoffs", {
    p_tournament: tournamentId,
    p_matches: payload,
  });
  if (error) return { error: error.message };

  revalidatePath(FNF_PATH);
  return { ok: true };
}
