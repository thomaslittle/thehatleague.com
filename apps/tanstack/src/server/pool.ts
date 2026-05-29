import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export const POOL_SELECT =
  "id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, rank_2v2, rank_3v3, peak_rank, peak_rank_playlist, rl_tracker_url, is_captain, in_player_pool, created_at" as const;

export type PoolRow = {
  id: string;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  profile_avatar_url: string | null;
  rank_2v2: string | null;
  rank_3v3: string | null;
  peak_rank: string | null;
  peak_rank_playlist: string | null;
  rl_tracker_url: string | null;
  is_captain: boolean;
  in_player_pool: boolean;
  created_at: string | null;
};

export const getRecentSignups = createServerFn({ method: "GET" })
  .inputValidator((data: { limit?: number } | undefined) => ({
    limit: data?.limit ?? 6,
  }))
  .handler(async ({ data }): Promise<PoolRow[]> => {
    const supabase = createSupabaseServerClient();
    const { data: rows } = await supabase
      .from("profiles")
      .select(POOL_SELECT)
      .eq("in_player_pool", true)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    return (rows ?? []) as PoolRow[];
  });

export const getPoolCount = createServerFn({ method: "GET" }).handler(
  async (): Promise<number> => {
    const supabase = createSupabaseServerClient();
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("in_player_pool", true);
    return count ?? 0;
  },
);

/**
 * Where the signed-in viewer sits in the in-pool peak-rank leaderboard.
 * Returns `{ position, total }` where position is 1-indexed; 0 means
 * "not in pool" or "no peak rank set."
 */
export const getPoolPosition = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ position: number; total: number }> => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { position: 0, total: 0 };
    const { data: rows } = await supabase
      .from("profiles")
      .select("id, peak_rank")
      .eq("in_player_pool", true);
    if (!rows) return { position: 0, total: 0 };

    // Match rankWeight semantics (lib/ranks.ts) but inlined to avoid an
    // extra import: index 0 = Unranked, 22 = Supersonic Legend.
    const TIERS = [
      "Unranked",
      "Bronze I",
      "Bronze II",
      "Bronze III",
      "Silver I",
      "Silver II",
      "Silver III",
      "Gold I",
      "Gold II",
      "Gold III",
      "Platinum I",
      "Platinum II",
      "Platinum III",
      "Diamond I",
      "Diamond II",
      "Diamond III",
      "Champion I",
      "Champion II",
      "Champion III",
      "Grand Champion I",
      "Grand Champion II",
      "Grand Champion III",
      "Supersonic Legend",
    ];
    function weight(v: string | null): number {
      if (!v) return -1;
      const lower = v.toLowerCase();
      for (let i = TIERS.length - 1; i >= 0; i -= 1) {
        if (lower.startsWith(TIERS[i]!.toLowerCase())) return i;
      }
      return -1;
    }

    const ranked = rows
      .map((p) => ({ id: p.id, w: weight(p.peak_rank) }))
      .sort((a, b) => b.w - a.w || a.id.localeCompare(b.id));
    const position = ranked.findIndex((r) => r.id === user.id) + 1;
    return { position, total: ranked.length };
  },
);

export const getFullPool = createServerFn({ method: "GET" }).handler(
  async (): Promise<PoolRow[]> => {
    const supabase = createSupabaseServerClient();
    const { data: rows } = await supabase
      .from("profiles")
      .select(POOL_SELECT)
      .eq("in_player_pool", true)
      .order("created_at", { ascending: false });
    return (rows ?? []) as PoolRow[];
  },
);

export type PlayerProfile = PoolRow & {
  is_admin: boolean;
  is_captain_applicant: boolean;
  is_developer: boolean;
  ranks_updated_at: string | null;
  profile_banner_url: string | null;
  bio: string | null;
  social_links: Json | null;
  captain_pitch: string | null;
};

const PROFILE_SELECT =
  POOL_SELECT +
  ", is_admin, is_captain_applicant, is_developer, ranks_updated_at, profile_banner_url, bio, social_links, captain_pitch";

export const searchPlayers = createServerFn({ method: "GET" })
  .inputValidator((data: { q: string }) => ({
    q: (data.q ?? "").trim().slice(0, 64),
  }))
  .handler(
    async ({
      data,
    }): Promise<
      Pick<
        PoolRow,
        | "id"
        | "discord_username"
        | "discord_global_name"
        | "discord_avatar_url"
        | "profile_avatar_url"
        | "is_captain"
        | "peak_rank"
      >[]
    > => {
      if (!data.q) return [];
      const supabase = createSupabaseServerClient();
      const like = `%${data.q.replace(/[%_]/g, "\\$&")}%`;
      const { data: rows } = await supabase
        .from("profiles")
        .select(
          "id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, is_captain, peak_rank",
        )
        .or(
          `discord_username.ilike.${like},discord_global_name.ilike.${like}`,
        )
        .limit(10);
      return rows ?? [];
    },
  );

export type ConfirmedCaptain = {
  id: string;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  profile_avatar_url: string | null;
  peak_rank: string | null;
  peak_rank_playlist: string | null;
  captain_pitch: string | null;
};

export const getConfirmedCaptains = createServerFn({ method: "GET" }).handler(
  async (): Promise<ConfirmedCaptain[]> => {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, peak_rank, peak_rank_playlist, captain_pitch",
      )
      .eq("is_captain", true)
      .order("created_at", { ascending: true });
    return (data ?? []) as ConfirmedCaptain[];
  },
);

export const getPlayerByUsername = createServerFn({ method: "GET" })
  .inputValidator((data: { username: string }) => data)
  .handler(async ({ data }): Promise<PlayerProfile | null> => {
    const supabase = createSupabaseServerClient();
    const { data: row } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .ilike("discord_username", data.username)
      .maybeSingle();
    return (row ?? null) as PlayerProfile | null;
  });
