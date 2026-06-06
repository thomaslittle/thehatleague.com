import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeason } from "@/lib/data/season";

export interface CombineEntry {
  profileId: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  peakRank: string | null;
  rank3v3: string | null;
  rank2v2: string | null;
  trackerUrl: string | null;
  /** Primary clip (first of clipUrls) — kept for back-compat. */
  showcaseClipUrl: string | null;
  /** Full ordered reel of showcase clip links. */
  clipUrls: string[];
  preferredRole: string | null;
  secondaryRole: string | null;
  availability: string | null;
  notes: string | null;
}

/** All combine submissions for a season, enriched with profile + ranks. */
export async function loadCombineBoard(seasonId: string): Promise<CombineEntry[]> {
  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("combine_profiles")
    .select("profile_id, showcase_clip_url, clip_urls, preferred_role, secondary_role, availability, notes")
    .eq("season_id", seasonId);
  if (!rows?.length) return [];

  const ids = rows.map((r) => r.profile_id);
  const { data: profs } = await supabase
    .from("profiles")
    .select(
      "id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, peak_rank, rank_3v3, rank_2v2, rl_tracker_url",
    )
    .in("id", ids);
  const byId = new Map(
    (profs ?? []).map((p) => [
      p.id,
      {
        name: p.discord_global_name ?? p.discord_username ?? "Player",
        username: p.discord_username,
        avatarUrl: p.profile_avatar_url ?? p.discord_avatar_url,
        peakRank: p.peak_rank,
        rank3v3: p.rank_3v3,
        rank2v2: p.rank_2v2,
        trackerUrl: p.rl_tracker_url,
      },
    ]),
  );

  return rows
    .map((r) => {
      const p = byId.get(r.profile_id);
      if (!p) return null;
      const clipUrls =
        r.clip_urls && r.clip_urls.length > 0
          ? r.clip_urls
          : r.showcase_clip_url
            ? [r.showcase_clip_url]
            : [];
      return {
        profileId: r.profile_id,
        ...p,
        showcaseClipUrl: r.showcase_clip_url,
        clipUrls,
        preferredRole: r.preferred_role,
        secondaryRole: r.secondary_role,
        availability: r.availability,
        notes: r.notes,
      };
    })
    .filter((x): x is CombineEntry => x !== null);
}

/** A player's combine scouting profile, normalised — shared by the combine
 *  board and the player profile page so both surfaces show the same data.
 *  Returns null when the player has no meaningful combine entry. */
export interface PlayerCombineView {
  preferredRole: string | null;
  secondaryRole: string | null;
  availability: string | null;
  notes: string | null;
  clipUrls: string[];
}

export async function loadPlayerCombine(
  profileId: string,
): Promise<PlayerCombineView | null> {
  const season = await getActiveSeason();
  if (!season) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("combine_profiles")
    .select("showcase_clip_url, clip_urls, preferred_role, secondary_role, availability, notes")
    .eq("season_id", season.id)
    .eq("profile_id", profileId)
    .maybeSingle();
  if (!data) return null;
  const clipUrls =
    data.clip_urls && data.clip_urls.length > 0
      ? data.clip_urls
      : data.showcase_clip_url
        ? [data.showcase_clip_url]
        : [];
  // Skip empty shells (a row with no role/availability/notes/clips).
  if (
    !data.preferred_role &&
    !data.secondary_role &&
    !data.availability &&
    !data.notes &&
    clipUrls.length === 0
  ) {
    return null;
  }
  return {
    preferredRole: data.preferred_role,
    secondaryRole: data.secondary_role,
    availability: data.availability,
    notes: data.notes,
    clipUrls,
  };
}

/** The signed-in user's combine entry for a season (to prefill the form). */
export async function loadMyCombine(seasonId: string, profileId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("combine_profiles")
    .select("showcase_clip_url, clip_urls, preferred_role, secondary_role, availability, notes")
    .eq("season_id", seasonId)
    .eq("profile_id", profileId)
    .maybeSingle();
  return data;
}
