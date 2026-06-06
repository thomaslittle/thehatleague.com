import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface PointsLeader {
  profileId: string;
  name: string;
  username: string | null;
  points: number;
}

/** Top point-earners for a season (the "power players" board). */
export async function loadPointsLeaders(seasonId: string, limit = 10): Promise<PointsLeader[]> {
  const supabase = await createSupabaseServerClient();
  const { data: pts } = await supabase
    .from("player_points_view")
    .select("profile_id, points")
    .eq("season_id", seasonId);
  if (!pts?.length) return [];

  const ranked = [...pts]
    .filter((p) => p.profile_id)
    .sort((a, b) => Number(b.points ?? 0) - Number(a.points ?? 0))
    .slice(0, limit);
  const ids = ranked.map((p) => p.profile_id as string);
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, discord_username, discord_global_name")
    .in("id", ids);
  const byId = new Map(
    (profs ?? []).map((p) => [p.id, { name: p.discord_global_name ?? p.discord_username ?? "Player", username: p.discord_username }]),
  );
  return ranked.map((p) => {
    const nm = byId.get(p.profile_id as string);
    return {
      profileId: p.profile_id as string,
      name: nm?.name ?? "Player",
      username: nm?.username ?? null,
      points: Number(p.points ?? 0),
    };
  });
}

export interface CareerStats {
  seasons: number;
  gp: number;
  goals: number;
  assists: number;
  saves: number;
  demos: number;
}

/** A player's career totals — summed across every season they have stats in. */
export async function loadCareerStats(profileId: string): Promise<CareerStats> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("player_season_stats")
    .select("season_id, games_played, goals, assists, saves, demos")
    .eq("profile_id", profileId);
  const rows = data ?? [];
  return {
    seasons: new Set(rows.map((r) => r.season_id)).size,
    gp: rows.reduce((s, r) => s + Number(r.games_played ?? 0), 0),
    goals: rows.reduce((s, r) => s + Number(r.goals ?? 0), 0),
    assists: rows.reduce((s, r) => s + Number(r.assists ?? 0), 0),
    saves: rows.reduce((s, r) => s + Number(r.saves ?? 0), 0),
    demos: rows.reduce((s, r) => s + Number(r.demos ?? 0), 0),
  };
}

export interface SeasonLeaderRow {
  profileId: string;
  name: string;
  username: string | null;
  conference: string | null;
  teamName: string | null;
  gp: number;
  goals: number;
  assists: number;
  saves: number;
  demos: number;
  score: number;
}

/**
 * Per-player season totals from the `player_season_stats` view, enriched with
 * display name + team/conference (for the leaderboards filters). Returns [] when
 * no stats exist yet.
 */
export async function loadSeasonLeaders(seasonId: string): Promise<SeasonLeaderRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data: stats } = await supabase
    .from("player_season_stats")
    .select("profile_id, games_played, goals, assists, saves, demos, score")
    .eq("season_id", seasonId);
  if (!stats?.length) return [];

  const ids = stats.map((s) => s.profile_id).filter((x): x is string => Boolean(x));

  const [{ data: profs }, { data: members }] = await Promise.all([
    supabase.from("profiles").select("id, discord_username, discord_global_name").in("id", ids),
    supabase
      .from("team_members")
      .select("profile_id, teams:team_id(name, conference)")
      .eq("season_id", seasonId)
      .in("profile_id", ids),
  ]);

  const nameById = new Map<string, { name: string; username: string | null }>();
  for (const p of profs ?? []) {
    nameById.set(p.id, {
      name: p.discord_global_name ?? p.discord_username ?? "Player",
      username: p.discord_username,
    });
  }
  type MemberRow = { profile_id: string; teams: { name: string; conference: string | null } | null };
  const teamById = new Map<string, { name: string; conference: string | null }>();
  for (const m of (members ?? []) as unknown as MemberRow[]) {
    if (m.teams) teamById.set(m.profile_id, m.teams);
  }

  return stats
    .filter((s) => s.profile_id)
    .map((s) => {
      const pid = s.profile_id as string;
      const nm = nameById.get(pid);
      const tm = teamById.get(pid);
      return {
        profileId: pid,
        name: nm?.name ?? "Player",
        username: nm?.username ?? null,
        conference: tm?.conference ?? null,
        teamName: tm?.name ?? null,
        gp: Number(s.games_played ?? 0),
        goals: Number(s.goals ?? 0),
        assists: Number(s.assists ?? 0),
        saves: Number(s.saves ?? 0),
        demos: Number(s.demos ?? 0),
        score: Number(s.score ?? 0),
      };
    });
}
