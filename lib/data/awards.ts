import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface BadgeCatalogRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  tier: string;
  icon: string | null;
  earnedCount: number;
}

export interface EarnedBadge {
  slug: string;
  name: string;
  description: string | null;
  tier: string;
  icon: string | null;
  awardedAt: string;
}

/** All active badges + how many players hold each. */
export async function loadBadgeCatalog(): Promise<BadgeCatalogRow[]> {
  const supabase = await createSupabaseServerClient();
  const [{ data: badges }, { data: held }] = await Promise.all([
    supabase.from("badges").select("id, slug, name, description, category, tier, icon").eq("is_active", true),
    supabase.from("player_badges").select("badge_id"),
  ]);
  const counts = new Map<string, number>();
  for (const h of held ?? []) counts.set(h.badge_id, (counts.get(h.badge_id) ?? 0) + 1);

  const order: Record<string, number> = { bronze: 0, silver: 1, gold: 2, legendary: 3 };
  return (badges ?? [])
    .map((b) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      description: b.description,
      category: b.category,
      tier: b.tier,
      icon: b.icon,
      earnedCount: counts.get(b.id) ?? 0,
    }))
    .sort((a, b) => (order[a.tier] ?? 0) - (order[b.tier] ?? 0) || a.name.localeCompare(b.name));
}

/** Badges a single player has earned (most recent first). */
export async function loadPlayerBadges(profileId: string): Promise<EarnedBadge[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("player_badges")
    .select("awarded_at, badges:badge_id(slug, name, description, tier, icon)")
    .eq("profile_id", profileId)
    .order("awarded_at", { ascending: false });
  type Row = {
    awarded_at: string;
    badges: { slug: string; name: string; description: string | null; tier: string; icon: string | null } | null;
  };
  return ((data ?? []) as unknown as Row[])
    .filter((r) => r.badges)
    .map((r) => ({
      slug: r.badges!.slug,
      name: r.badges!.name,
      description: r.badges!.description,
      tier: r.badges!.tier,
      icon: r.badges!.icon,
      awardedAt: r.awarded_at,
    }));
}

export interface BadgeUnlock {
  id: string;
  playerName: string;
  badgeName: string;
  tier: string;
  icon: string | null;
}

/** The most recent badge unlock in a season (for the OBS badge-unlock overlay). */
export async function loadLatestBadgeUnlock(seasonId: string): Promise<BadgeUnlock | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("player_badges")
    .select(
      "id, profiles:profile_id(discord_global_name, discord_username), badges:badge_id(name, tier, icon)",
    )
    .eq("season_id", seasonId)
    .order("awarded_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  type Row = {
    id: string;
    profiles: { discord_global_name: string | null; discord_username: string | null } | null;
    badges: { name: string; tier: string; icon: string | null } | null;
  };
  const row = data as unknown as Row;
  if (!row.badges) return null;
  return {
    id: row.id,
    playerName: row.profiles?.discord_global_name ?? row.profiles?.discord_username ?? "Player",
    badgeName: row.badges.name,
    tier: row.badges.tier,
    icon: row.badges.icon,
  };
}

export interface RankHistoryPoint {
  capturedAt: string;
  peakRank: string | null;
}

/** A player's peak-rank history (oldest → newest) for the profile chart. */
export async function loadRankHistory(profileId: string): Promise<RankHistoryPoint[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profile_rank_history")
    .select("captured_at, peak_rank")
    .eq("profile_id", profileId)
    .order("captured_at", { ascending: true });
  return (data ?? []).map((r) => ({ capturedAt: r.captured_at, peakRank: r.peak_rank }));
}

/** A player's total points (all seasons) from the points view. */
export async function loadPlayerPoints(profileId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("player_points_view")
    .select("points")
    .eq("profile_id", profileId);
  return (data ?? []).reduce((sum, r) => sum + Number(r.points ?? 0), 0);
}
