"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeason } from "@/lib/data/season";
import { awardPoints, POINT_VALUES } from "@/lib/awards/points";
import { awardBadge } from "@/lib/awards/engine";

/**
 * Draft Combine submission. In-pool players build a scouting profile so captains
 * can evaluate them before draft night. Upserts on (season, profile); awards the
 * combine points + "combine-ready" badge once.
 */

export interface CombineActionState {
  ok?: boolean;
  error?: string;
}

export async function submitCombineProfile(input: {
  /** @deprecated single clip — prefer `clipUrls`. Still accepted as a fallback. */
  showcaseClipUrl?: string | null;
  /** Ordered reel of showcase clip links. */
  clipUrls?: string[];
  preferredRole?: string | null;
  secondaryRole?: string | null;
  availability?: string | null;
  notes?: string | null;
}): Promise<CombineActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to submit a combine profile." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("in_player_pool")
    .eq("id", user.id)
    .single();
  if (!profile?.in_player_pool) return { error: "Join the player pool first." };

  const season = await getActiveSeason();
  if (!season) return { error: "No active season." };

  // Normalise the clip reel: trim, drop blanks, validate as URLs, dedupe,
  // cap at a sane maximum. Falls back to the legacy single field.
  const rawClips =
    input.clipUrls && input.clipUrls.length > 0
      ? input.clipUrls
      : input.showcaseClipUrl
        ? [input.showcaseClipUrl]
        : [];
  const clips: string[] = [];
  for (const raw of rawClips) {
    const c = (raw ?? "").trim();
    if (!c) continue;
    if (!/^https?:\/\//i.test(c)) {
      return { error: "Each clip must be a full URL (https://…)." };
    }
    if (!clips.includes(c)) clips.push(c);
  }
  if (clips.length > 8) {
    return { error: "You can add up to 8 clips." };
  }

  const { error } = await supabase.from("combine_profiles").upsert(
    {
      season_id: season.id,
      profile_id: user.id,
      showcase_clip_url: clips[0] ?? null,
      clip_urls: clips,
      preferred_role: input.preferredRole || null,
      secondary_role: input.secondaryRole || null,
      availability: (input.availability ?? "").trim() || null,
      notes: (input.notes ?? "").trim() || null,
    },
    { onConflict: "season_id,profile_id" },
  );
  if (error) return { error: error.message };

  // Reward completing a combine profile (idempotent).
  await awardPoints(supabase, {
    profileId: user.id,
    seasonId: season.id,
    source: "combine",
    points: POINT_VALUES.combine,
    refType: "combine",
    refId: season.id,
  });
  await awardBadge(supabase, { profileId: user.id, badgeSlug: "combine-ready", seasonId: season.id });

  revalidatePath("/combine");
  revalidatePath("/the-draft");
  return { ok: true };
}
