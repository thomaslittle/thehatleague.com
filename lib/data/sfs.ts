import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cleanDiscordUsername } from "@/lib/discord/name";

export type SfsOwnGoalLeader = {
  /** Stable grouping key (per profile or per typed name). */
  key: string;
  profileId: string | null;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  count: number;
};

export type SfsOwnGoalEntry = {
  id: string;
  profileId: string | null;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  note: string | null;
  createdAt: string;
};

export type SfsOwnGoalStats = {
  total: number;
  leaders: SfsOwnGoalLeader[];
  recent: SfsOwnGoalEntry[];
};

type ProfileLite = {
  name: string;
  username: string | null;
  avatarUrl: string | null;
};

function mapProfile(p: {
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  profile_avatar_url: string | null;
}): ProfileLite {
  return {
    name: p.discord_global_name ?? cleanDiscordUsername(p.discord_username) ?? "Player",
    username: cleanDiscordUsername(p.discord_username),
    avatarUrl: p.profile_avatar_url ?? p.discord_avatar_url ?? null,
  };
}

/** Aggregate own-goal stats for the SFS page + overlay: total, the wall of
 *  shame (per-player counts), and a recent feed. */
export const getSfsOwnGoalStats = cache(async (): Promise<SfsOwnGoalStats> => {
  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("sfs_own_goals")
    .select("id, profile_id, player_name, note, created_at")
    .order("created_at", { ascending: false });
  const list = rows ?? [];

  const ids = [
    ...new Set(list.map((r) => r.profile_id).filter(Boolean) as string[]),
  ];
  const profMap = new Map<string, ProfileLite>();
  if (ids.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select(
        "id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url",
      )
      .in("id", ids);
    for (const p of profs ?? []) profMap.set(p.id, mapProfile(p));
  }

  const agg = new Map<string, SfsOwnGoalLeader>();
  for (const r of list) {
    let leader: SfsOwnGoalLeader;
    if (r.profile_id) {
      const p = profMap.get(r.profile_id);
      const key = `p:${r.profile_id}`;
      leader = agg.get(key) ?? {
        key,
        profileId: r.profile_id,
        name: p?.name ?? "Player",
        username: p?.username ?? null,
        avatarUrl: p?.avatarUrl ?? null,
        count: 0,
      };
    } else {
      const nm = (r.player_name ?? "").trim();
      const key = `n:${nm.toLowerCase()}`;
      leader = agg.get(key) ?? {
        key,
        profileId: null,
        name: nm || "Unknown",
        username: null,
        avatarUrl: null,
        count: 0,
      };
    }
    leader.count += 1;
    agg.set(leader.key, leader);
  }
  const leaders = [...agg.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );

  const recent: SfsOwnGoalEntry[] = list.slice(0, 12).map((r) => {
    const p = r.profile_id ? profMap.get(r.profile_id) : null;
    return {
      id: r.id,
      profileId: r.profile_id ?? null,
      name: p?.name ?? (r.player_name ?? "Unknown"),
      username: p?.username ?? null,
      avatarUrl: p?.avatarUrl ?? null,
      note: r.note ?? null,
      createdAt: r.created_at,
    };
  });

  return { total: list.length, leaders, recent };
});

/** Own-goal count for a single registered player (their profile stat). */
export const getProfileOwnGoalCount = cache(
  async (profileId: string): Promise<number> => {
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase
      .from("sfs_own_goals")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId);
    return count ?? 0;
  },
);

export type SfsTaggablePlayer = {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
};

/** Registered players that can be tagged in the own-goal form. */
export const getSfsTaggablePlayers = cache(
  async (): Promise<SfsTaggablePlayer[]> => {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url",
      )
      .eq("is_mock", false);
    return (data ?? [])
      .map((p) => ({ id: p.id, ...mapProfile(p) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
);
