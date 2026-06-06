import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cleanDiscordUsername } from "@/lib/discord/name";
import { rankWeight } from "@/lib/data/rank-sort";
import {
  computeStandings,
  orderStandings,
  type FnfMatchLite,
  type FnfStanding,
} from "@/lib/fnf/pairing";

export type FnfStatus =
  | "registration"
  | "teams"
  | "swiss"
  | "playoffs"
  | "complete";

export type FnfTournament = {
  id: string;
  name: string;
  status: FnfStatus;
  swissRounds: number;
  currentRound: number;
  teamSize: number;
  swissGames: number;
  playoffBestOf: number;
  finalBestOf: number;
  playoffCut: number;
  startsAt: string | null;
};

export type FnfPlayerCard = {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  rankValue: string | null;
  rankWeight: number;
};

export type FnfTeamCard = {
  id: string;
  seed: number;
  name: string;
  members: FnfPlayerCard[];
};

export type FnfMatchCard = {
  id: string;
  stage: "swiss" | "playoffs";
  round: number;
  slot: number;
  teamAId: string | null;
  teamBId: string | null;
  teamAName: string | null;
  teamBName: string | null;
  teamASeed: number | null;
  teamBSeed: number | null;
  teamAMembers: { name: string; avatarUrl: string | null }[];
  teamBMembers: { name: string; avatarUrl: string | null }[];
  scoreA: number | null;
  scoreB: number | null;
  winnerTeamId: string | null;
  status: "pending" | "reported";
  bestOf: number;
};

export type FnfState = {
  tournament: FnfTournament;
  registrations: FnfPlayerCard[];
  teams: FnfTeamCard[];
  matches: FnfMatchCard[];
  standings: FnfStanding[];
};

function displayName(p: {
  discord_global_name: string | null;
  discord_username: string | null;
}): string {
  return (
    p.discord_global_name ??
    cleanDiscordUsername(p.discord_username) ??
    "Player"
  );
}

function mapTournament(row: Record<string, unknown>): FnfTournament {
  return {
    id: row.id as string,
    name: row.name as string,
    status: row.status as FnfStatus,
    swissRounds: row.swiss_rounds as number,
    currentRound: row.current_round as number,
    teamSize: row.team_size as number,
    swissGames: row.swiss_games as number,
    playoffBestOf: row.playoff_best_of as number,
    finalBestOf: row.final_best_of as number,
    playoffCut: row.playoff_cut as number,
    startsAt: (row.starts_at as string | null) ?? null,
  };
}

/** The current tournament — most recently created. */
export const getActiveFnf = cache(async (): Promise<FnfTournament | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("fnf_tournaments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? mapTournament(data) : null;
});

/** Full state for the FNF page: registrations, teams, matches, standings. */
export const getFnfState = cache(
  async (tournamentId?: string): Promise<FnfState | null> => {
    const supabase = await createSupabaseServerClient();

    let tournament: FnfTournament | null;
    if (tournamentId) {
      const { data } = await supabase
        .from("fnf_tournaments")
        .select("*")
        .eq("id", tournamentId)
        .maybeSingle();
      tournament = data ? mapTournament(data) : null;
    } else {
      tournament = await getActiveFnf();
    }
    if (!tournament) return null;

    const tid = tournament.id;
    const [regsRes, teamsRes, membersRes, matchesRes] = await Promise.all([
      supabase
        .from("fnf_registrations")
        .select("profile_id, rank_value, rank_weight")
        .eq("tournament_id", tid),
      supabase
        .from("fnf_teams")
        .select("id, seed, name")
        .eq("tournament_id", tid)
        .order("seed", { ascending: true }),
      supabase
        .from("fnf_team_members")
        .select("team_id, profile_id")
        .eq("tournament_id", tid),
      supabase
        .from("fnf_matches")
        .select(
          "id, stage, round, slot, team_a_id, team_b_id, score_a, score_b, winner_team_id, status, best_of",
        )
        .eq("tournament_id", tid)
        .order("round", { ascending: true })
        .order("slot", { ascending: true }),
    ]);

    const regs = regsRes.data ?? [];
    const teamRows = teamsRes.data ?? [];
    const members = membersRes.data ?? [];
    const matchRows = matchesRes.data ?? [];

    // Resolve every referenced profile in one query.
    const profileIds = new Set<string>();
    for (const r of regs) profileIds.add(r.profile_id as string);
    for (const m of members) profileIds.add(m.profile_id as string);

    const profileMap = new Map<
      string,
      {
        id: string;
        name: string;
        username: string | null;
        avatarUrl: string | null;
        rank2v2: string | null;
        peakRank: string | null;
      }
    >();
    if (profileIds.size > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select(
          "id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, rank_2v2, peak_rank",
        )
        .in("id", [...profileIds]);
      for (const p of profiles ?? []) {
        profileMap.set(p.id, {
          id: p.id,
          name: displayName(p),
          username: cleanDiscordUsername(p.discord_username),
          avatarUrl: p.profile_avatar_url ?? p.discord_avatar_url ?? null,
          rank2v2: p.rank_2v2,
          peakRank: p.peak_rank,
        });
      }
    }

    const registrations: FnfPlayerCard[] = regs.map((r) => {
      const p = profileMap.get(r.profile_id as string);
      // Show the player's LIVE current rank (so rank updates reflect here),
      // falling back to the registration snapshot only if the profile is gone.
      const liveRank = p?.rank2v2 ?? p?.peakRank ?? null;
      let liveWeight = rankWeight(p?.rank2v2);
      if (liveWeight <= 0) liveWeight = rankWeight(p?.peakRank);
      return {
        id: r.profile_id as string,
        name: p?.name ?? "Player",
        username: p?.username ?? null,
        avatarUrl: p?.avatarUrl ?? null,
        rankValue: liveRank ?? (r.rank_value as string | null) ?? null,
        rankWeight: liveWeight >= 0 ? liveWeight : ((r.rank_weight as number) ?? -1),
      };
    });
    // Best players first in the pool list.
    registrations.sort((a, b) => b.rankWeight - a.rankWeight);

    const membersByTeam = new Map<string, string[]>();
    for (const m of members) {
      const list = membersByTeam.get(m.team_id as string) ?? [];
      list.push(m.profile_id as string);
      membersByTeam.set(m.team_id as string, list);
    }

    const teams: FnfTeamCard[] = teamRows.map((t) => ({
      id: t.id as string,
      seed: t.seed as number,
      name: t.name as string,
      members: (membersByTeam.get(t.id as string) ?? [])
        .map((pid) => {
          const p = profileMap.get(pid);
          return {
            id: pid,
            name: p?.name ?? "Player",
            username: p?.username ?? null,
            avatarUrl: p?.avatarUrl ?? null,
            rankValue: p?.rank2v2 ?? null,
            rankWeight: rankWeight(p?.rank2v2),
          };
        })
        .sort((a, b) => b.rankWeight - a.rankWeight),
    }));

    const teamMeta = new Map(teams.map((t) => [t.id, t]));
    const matches: FnfMatchCard[] = matchRows.map((m) => {
      const a = m.team_a_id ? teamMeta.get(m.team_a_id as string) : undefined;
      const b = m.team_b_id ? teamMeta.get(m.team_b_id as string) : undefined;
      return {
        id: m.id as string,
        stage: m.stage as "swiss" | "playoffs",
        round: m.round as number,
        slot: m.slot as number,
        teamAId: (m.team_a_id as string | null) ?? null,
        teamBId: (m.team_b_id as string | null) ?? null,
        teamAName: a?.name ?? null,
        teamBName: b?.name ?? null,
        teamASeed: a?.seed ?? null,
        teamBSeed: b?.seed ?? null,
        teamAMembers:
          a?.members.map((mem) => ({
            name: mem.name,
            avatarUrl: mem.avatarUrl,
          })) ?? [],
        teamBMembers:
          b?.members.map((mem) => ({
            name: mem.name,
            avatarUrl: mem.avatarUrl,
          })) ?? [],
        scoreA: (m.score_a as number | null) ?? null,
        scoreB: (m.score_b as number | null) ?? null,
        winnerTeamId: (m.winner_team_id as string | null) ?? null,
        status: m.status as "pending" | "reported",
        bestOf: m.best_of as number,
      };
    });

    const matchLites: FnfMatchLite[] = matches.map((m) => ({
      stage: m.stage,
      round: m.round,
      teamAId: m.teamAId,
      teamBId: m.teamBId,
      winnerTeamId: m.winnerTeamId,
      scoreA: m.scoreA,
      scoreB: m.scoreB,
      status: m.status,
    }));
    const standings = orderStandings(
      computeStandings(
        teams.map((t) => ({ id: t.id, seed: t.seed, name: t.name })),
        matchLites,
      ),
    );

    return { tournament, registrations, teams, matches, standings };
  },
);
