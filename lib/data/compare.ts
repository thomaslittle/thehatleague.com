import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeason } from "@/lib/data/season";

export interface CompareCard {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  peakRank: string | null;
  rank3v3: string | null;
  rank2v2: string | null;
  gp: number;
  goals: number;
  assists: number;
  saves: number;
  points: number;
  patches: number;
}

async function buildCard(username: string): Promise<CompareCard | null> {
  const supabase = await createSupabaseServerClient();
  const { data: p } = await supabase
    .from("profiles")
    .select("id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, peak_rank, rank_3v3, rank_2v2")
    .ilike("discord_username", username)
    .maybeSingle();
  if (!p) return null;

  const season = await getActiveSeason();
  const [stats, points, patches] = await Promise.all([
    season
      ? supabase
          .from("player_season_stats")
          .select("games_played, goals, assists, saves")
          .eq("season_id", season.id)
          .eq("profile_id", p.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("player_points_view").select("points").eq("profile_id", p.id),
    supabase.from("player_badges").select("id", { count: "exact", head: true }).eq("profile_id", p.id),
  ]);

  const s = stats.data;
  return {
    id: p.id,
    name: p.discord_global_name ?? p.discord_username ?? "Player",
    username: p.discord_username,
    avatarUrl: p.profile_avatar_url ?? p.discord_avatar_url,
    peakRank: p.peak_rank,
    rank3v3: p.rank_3v3,
    rank2v2: p.rank_2v2,
    gp: Number(s?.games_played ?? 0),
    goals: Number(s?.goals ?? 0),
    assists: Number(s?.assists ?? 0),
    saves: Number(s?.saves ?? 0),
    points: (points.data ?? []).reduce((sum, r) => sum + Number(r.points ?? 0), 0),
    patches: patches.count ?? 0,
  };
}

/** Side-by-side scouting comparison of two players (by username). */
export async function loadCompare(
  a: string | null,
  b: string | null,
): Promise<{ a: CompareCard | null; b: CompareCard | null }> {
  const [cardA, cardB] = await Promise.all([
    a ? buildCard(a) : Promise.resolve(null),
    b ? buildCard(b) : Promise.resolve(null),
  ]);
  return { a: cardA, b: cardB };
}
