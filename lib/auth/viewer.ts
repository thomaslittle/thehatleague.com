import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cleanDiscordUsername } from "@/lib/discord/name";
import type { ViewerInfo } from "@/components/landing/site-header";

/**
 * Resolve the current signed-in viewer (or null) once per request.
 *
 * Wrapped in React `cache()` so the auth round-trip + profile read is
 * deduped across the layout shell and the page body within a single
 * server render — both can call this freely without an extra query.
 */
export const getViewer = cache(async (): Promise<ViewerInfo | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, is_admin, in_player_pool, is_captain",
    )
    .eq("id", user.id)
    .single();

  // Admins get a count of pending captain + league-ops applications so the
  // header avatar can show a notification badge. Skip for non-admins.
  let pendingAdminQueue = 0;
  if (profile?.is_admin) {
    const [captainQueue, leagueOpsQueue] = await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_captain_applicant", true)
        .eq("is_captain", false),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_admin_applicant", true)
        .eq("is_admin", false),
    ]);
    pendingAdminQueue =
      (captainQueue.count ?? 0) + (leagueOpsQueue.count ?? 0);
  }

  return {
    isAuthenticated: true,
    displayName:
      profile?.discord_global_name ??
      cleanDiscordUsername(profile?.discord_username) ??
      null,
    username: cleanDiscordUsername(profile?.discord_username),
    avatarUrl:
      profile?.profile_avatar_url ?? profile?.discord_avatar_url ?? null,
    isAdmin: !!profile?.is_admin,
    inPool: !!profile?.in_player_pool,
    isCaptain: !!profile?.is_captain,
    pendingAdminQueue,
  };
});

export interface PoolStats {
  /** Players currently in the draft pool. */
  poolCount: number;
  /** Players flagged as captains. */
  captainCount: number;
}

/**
 * Aggregate counts that power the social-proof stat blocks in the hero
 * sections. Cached per request so multiple heroes share one pair of
 * head-only count queries.
 */
export const getPoolStats = cache(async (): Promise<PoolStats> => {
  const supabase = await createSupabaseServerClient();
  const [{ count: poolCount }, { count: captainCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("in_player_pool", true),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_captain", true),
  ]);
  return {
    poolCount: poolCount ?? 0,
    captainCount: captainCount ?? 0,
  };
});

export interface PoolAvatar {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  peakRank: string | null;
  /** Highest org role, for the avatar ring + tooltip. */
  role: "ops" | "captain" | null;
}

/**
 * Minimal avatar data for everyone in the pool (newest first), for the hero
 * avatar-stack social proof. Cached per request.
 */
export const getPoolAvatars = cache(
  async (limit = 40): Promise<PoolAvatar[]> => {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, peak_rank, is_captain, is_admin, created_at",
      )
      .eq("in_player_pool", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []).map((p) => ({
      id: p.id,
      name: p.discord_global_name ?? p.discord_username ?? "Player",
      username: cleanDiscordUsername(p.discord_username),
      avatarUrl: p.profile_avatar_url ?? p.discord_avatar_url ?? null,
      peakRank: p.peak_rank ?? null,
      role: p.is_admin ? ("ops" as const) : p.is_captain ? ("captain" as const) : null,
    }));
  },
);
