import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface StandingRow {
  teamId: string;
  name: string;
  slug: string;
  conference: string | null;
  color: string | null;
  gp: number;
  w: number;
  l: number;
  gf: number;
  ga: number;
  diff: number;
}

export interface MatchTeamLite {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  conference: string | null;
}

export interface MatchView {
  id: string;
  week: number | null;
  conference: string | null;
  roundLabel: string | null;
  bracket: string | null;
  status: string;
  scheduledAt: string | null;
  bestOf: number;
  homeScore: number;
  awayScore: number;
  winnerTeamId: string | null;
  home: MatchTeamLite | null;
  away: MatchTeamLite | null;
}

export interface MatchGameView {
  id: string;
  gameNumber: number;
  homeGoals: number;
  awayGoals: number;
  replayUrl: string | null;
}

const TEAM_LITE_SELECT = "id, name, slug, color, conference" as const;

export async function loadStandings(seasonId: string): Promise<StandingRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("standings_view")
    .select("team_id, name, slug, conference, color, gp, w, l, gf, ga, diff")
    .eq("season_id", seasonId);
  return (data ?? [])
    .map((r) => ({
      teamId: r.team_id as string,
      name: r.name as string,
      slug: r.slug as string,
      conference: r.conference as string | null,
      color: r.color as string | null,
      gp: Number(r.gp ?? 0),
      w: Number(r.w ?? 0),
      l: Number(r.l ?? 0),
      gf: Number(r.gf ?? 0),
      ga: Number(r.ga ?? 0),
      diff: Number(r.diff ?? 0),
    }))
    .sort((a, b) => b.w - a.w || b.diff - a.diff || b.gf - a.gf || a.name.localeCompare(b.name));
}

async function teamMap(seasonId: string): Promise<Map<string, MatchTeamLite>> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("teams").select(TEAM_LITE_SELECT).eq("season_id", seasonId);
  const m = new Map<string, MatchTeamLite>();
  for (const t of data ?? []) m.set(t.id, t);
  return m;
}

export async function loadSchedule(seasonId: string): Promise<MatchView[]> {
  const supabase = await createSupabaseServerClient();
  const [{ data: matches }, teams] = await Promise.all([
    supabase
      .from("matches")
      .select(
        "id, week, conference, round_label, bracket, status, scheduled_at, best_of, home_score, away_score, winner_team_id, home_team_id, away_team_id",
      )
      .eq("season_id", seasonId)
      .order("week", { ascending: true })
      .order("scheduled_at", { ascending: true, nullsFirst: false }),
    teamMap(seasonId),
  ]);
  return (matches ?? []).map((m) => ({
    id: m.id,
    week: m.week,
    conference: m.conference,
    roundLabel: m.round_label,
    bracket: m.bracket,
    status: m.status,
    scheduledAt: m.scheduled_at,
    bestOf: m.best_of,
    homeScore: m.home_score,
    awayScore: m.away_score,
    winnerTeamId: m.winner_team_id,
    home: teams.get(m.home_team_id) ?? null,
    away: teams.get(m.away_team_id) ?? null,
  }));
}

export async function loadMatch(
  matchId: string,
): Promise<{ match: MatchView; games: MatchGameView[] } | null> {
  const supabase = await createSupabaseServerClient();
  const { data: m } = await supabase
    .from("matches")
    .select(
      "id, season_id, week, conference, round_label, bracket, status, scheduled_at, best_of, home_score, away_score, winner_team_id, home_team_id, away_team_id",
    )
    .eq("id", matchId)
    .maybeSingle();
  if (!m) return null;

  const teams = await teamMap(m.season_id);
  const { data: games } = await supabase
    .from("match_games")
    .select("id, game_number, home_goals, away_goals, replay_url")
    .eq("match_id", matchId)
    .order("game_number", { ascending: true });

  return {
    match: {
      id: m.id,
      week: m.week,
      conference: m.conference,
      roundLabel: m.round_label,
      bracket: m.bracket,
      status: m.status,
      scheduledAt: m.scheduled_at,
      bestOf: m.best_of,
      homeScore: m.home_score,
      awayScore: m.away_score,
      winnerTeamId: m.winner_team_id,
      home: teams.get(m.home_team_id) ?? null,
      away: teams.get(m.away_team_id) ?? null,
    },
    games: (games ?? []).map((g) => ({
      id: g.id,
      gameNumber: g.game_number,
      homeGoals: g.home_goals,
      awayGoals: g.away_goals,
      replayUrl: g.replay_url,
    })),
  };
}

export interface PowerRankRow {
  teamId: string;
  name: string;
  slug: string;
  color: string | null;
  conference: string | null;
  rank: number;
  previousRank: number | null;
  blurb: string | null;
  /** +n = moved up n spots since last week, -n = dropped, 0 = held, null = new. */
  movement: number | null;
}

/** Latest published power-ranking week for a season, ordered best first. */
export async function loadPowerRankings(
  seasonId: string,
): Promise<{ week: number; rows: PowerRankRow[] } | null> {
  const supabase = await createSupabaseServerClient();
  const { data: weekRow } = await supabase
    .from("power_rankings")
    .select("week")
    .eq("season_id", seasonId)
    .order("week", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!weekRow) return null;
  const week = weekRow.week;

  const [{ data: rankings }, teams] = await Promise.all([
    supabase
      .from("power_rankings")
      .select("team_id, rank, previous_rank, blurb")
      .eq("season_id", seasonId)
      .eq("week", week)
      .order("rank", { ascending: true }),
    teamMap(seasonId),
  ]);

  const rows: PowerRankRow[] = (rankings ?? []).map((r) => {
    const t = teams.get(r.team_id);
    return {
      teamId: r.team_id,
      name: t?.name ?? "—",
      slug: t?.slug ?? "",
      color: t?.color ?? null,
      conference: t?.conference ?? null,
      rank: r.rank,
      previousRank: r.previous_rank,
      blurb: r.blurb,
      movement: r.previous_rank == null ? null : r.previous_rank - r.rank,
    };
  });
  return { week, rows };
}

export interface TeamPageData {
  team: MatchTeamLite & { captainId: string | null };
  roster: { id: string; name: string; username: string | null; avatarUrl: string | null; peakRank: string | null; isCaptain: boolean }[];
  matches: MatchView[];
  record: { w: number; l: number; gp: number };
}

export async function loadTeamBySlug(seasonId: string, slug: string): Promise<TeamPageData | null> {
  const supabase = await createSupabaseServerClient();
  const { data: team } = await supabase
    .from("teams")
    .select("id, name, slug, color, conference, captain_id")
    .eq("season_id", seasonId)
    .eq("slug", slug)
    .maybeSingle();
  if (!team) return null;

  const [{ data: members }, schedule, standings] = await Promise.all([
    supabase
      .from("team_members")
      .select(
        "is_captain, overall_pick, profiles:profile_id(id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, peak_rank)",
      )
      .eq("team_id", team.id)
      .order("is_captain", { ascending: false })
      .order("overall_pick", { ascending: true, nullsFirst: true }),
    loadSchedule(seasonId),
    loadStandings(seasonId),
  ]);

  type MemberRow = {
    is_captain: boolean;
    profiles:
      | {
          id: string;
          discord_username: string | null;
          discord_global_name: string | null;
          discord_avatar_url: string | null;
          profile_avatar_url: string | null;
          peak_rank: string | null;
        }
      | null;
  };

  const roster = ((members ?? []) as unknown as MemberRow[])
    .map((m) => {
      const p = m.profiles;
      if (!p) return null;
      return {
        id: p.id,
        name: p.discord_global_name ?? p.discord_username ?? "Player",
        username: p.discord_username,
        avatarUrl: p.profile_avatar_url ?? p.discord_avatar_url,
        peakRank: p.peak_rank,
        isCaptain: m.is_captain,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const matches = schedule.filter((m) => m.home?.id === team.id || m.away?.id === team.id);
  const row = standings.find((s) => s.teamId === team.id);

  return {
    team: { ...team, captainId: team.captain_id },
    roster,
    matches,
    record: { w: row?.w ?? 0, l: row?.l ?? 0, gp: row?.gp ?? 0 },
  };
}
