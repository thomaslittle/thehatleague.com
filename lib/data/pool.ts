// Shared pool-row shape used by both the server fetcher and the client
// realtime hook. Keeping this in one place stops the two from drifting.

import type { Profile } from "@/lib/supabase/types";

export type PoolRow = Pick<
  Profile,
  | "id"
  | "discord_username"
  | "discord_global_name"
  | "discord_avatar_url"
  | "profile_avatar_url"
  | "rank_2v2"
  | "rank_3v3"
  | "peak_rank"
  | "peak_rank_playlist"
  | "rl_tracker_url"
  | "is_captain"
  | "in_player_pool"
  | "created_at"
>;

export const POOL_SELECT =
  "id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, rank_2v2, rank_3v3, peak_rank, peak_rank_playlist, rl_tracker_url, is_captain, in_player_pool, created_at" as const;
