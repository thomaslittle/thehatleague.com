"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTrackerRanks } from "@/lib/tracker";
import { isValidTrackerUrl } from "@/lib/tracker/types";
import { RL_PEAK_PLAYLISTS, RL_RANK_TIERS } from "@/lib/data/rocket-league-ranks";
import { cleanDiscordUsername } from "@/lib/discord/name";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface OnboardingState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Pulls the freshest Discord metadata off the auth user and ensures a
 * profile row exists. Returns true on success.
 *
 * Why: in dev (and edge cases in prod) a profile row can go missing while
 * the auth.users row is still valid — the handle_new_user trigger only
 * fires on INSERT. Without an upsert here every onboarding submit silently
 * does `UPDATE … WHERE id = X` against zero rows and the user ends up
 * looping between /onboarding and /dashboard.
 */
async function ensureProfileRow(
  supabase: SupabaseClient<Database>,
  user: User,
): Promise<void> {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const rawUsername =
    (meta.user_name as string | undefined) ??
    (meta.preferred_username as string | undefined) ??
    (meta.name as string | undefined) ??
    null;
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      discord_id: (meta.provider_id as string | undefined) ?? null,
      discord_username: cleanDiscordUsername(rawUsername),
      discord_global_name: (meta.full_name as string | undefined) ?? null,
      discord_avatar_url: (meta.avatar_url as string | undefined) ?? null,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );
}

export async function submitOnboarding(
  _prev: OnboardingState | undefined,
  formData: FormData,
): Promise<OnboardingState> {
  const trackerUrl = String(formData.get("tracker_url") ?? "").trim();
  const rank2v2 = String(formData.get("rank_2v2") ?? "").trim();
  const rank3v3 = String(formData.get("rank_3v3") ?? "").trim();
  const peakRank = String(formData.get("peak_rank") ?? "").trim();
  const peakPlaylist = String(formData.get("peak_playlist") ?? "").trim();
  const from = String(formData.get("_from") ?? "");
  const shouldUpdatePool = formData.get("join_pool_present") === "1";
  const joinPool = formData.get("join_pool") === "1";

  const fieldErrors: Record<string, string> = {};

  if (!isValidTrackerUrl(trackerUrl)) {
    fieldErrors.tracker_url =
      "Paste your full rocketleague.tracker.network profile URL.";
  }
  if (!RL_RANK_TIERS.includes(rank2v2 as (typeof RL_RANK_TIERS)[number])) {
    fieldErrors.rank_2v2 = "Pick a 2v2 rank from the list.";
  }
  if (!RL_RANK_TIERS.includes(rank3v3 as (typeof RL_RANK_TIERS)[number])) {
    fieldErrors.rank_3v3 = "Pick a 3v3 rank from the list.";
  }
  if (!RL_RANK_TIERS.includes(peakRank as (typeof RL_RANK_TIERS)[number])) {
    fieldErrors.peak_rank = "Pick your peak rank from the list.";
  }
  if (
    !RL_PEAK_PLAYLISTS.includes(
      peakPlaylist as (typeof RL_PEAK_PLAYLISTS)[number],
    )
  ) {
    fieldErrors.peak_playlist = "Pick the playlist your peak rank was earned in.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You need to be signed in." };
  }

  // Self-heal: make sure there's a row to update.
  await ensureProfileRow(supabase, user);

  const ranks = await getTrackerRanks({
    trackerUrl,
    manual: {
      rank2v2,
      rank3v3,
      peakRank,
      peakPlaylist: peakPlaylist as (typeof RL_PEAK_PLAYLISTS)[number],
    },
  });

  const updates: Database["public"]["Tables"]["profiles"]["Update"] = {
    rl_tracker_url: ranks.trackerUrl,
    rank_2v2: ranks.rank2v2,
    rank_3v3: ranks.rank3v3,
    peak_rank: ranks.peakRank,
    peak_rank_playlist: ranks.peakPlaylist,
    ranks_updated_at: new Date().toISOString(),
  };

  if (shouldUpdatePool) {
    updates.in_player_pool = joinPool;
  }

  const { error: dbError } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (dbError) {
    return { error: `Couldn't save ranks: ${dbError.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/pool");
  if (from === "settings") {
    revalidatePath("/settings");
    redirect("/dashboard?settings_saved=rank_profile");
  }
  redirect(`/dashboard?welcome=1${joinPool ? "" : "&left=1"}`);
}

/** Land the user in the pool without ranks. They get a "finish up" nag on
 *  the dashboard until they fill the rank form. Captains can't draft them
 *  without ranks, but the league at least knows they want in. */
export async function skipOnboarding() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?redirect=/onboarding");

  await ensureProfileRow(supabase, user);

  await supabase
    .from("profiles")
    .update({ in_player_pool: true })
    .eq("id", user.id);

  revalidatePath("/dashboard");
  redirect("/dashboard?welcome=1&pending=1");
}

/** Flip the user's in_player_pool flag. Honours the current state — the
 *  form passes a "want_in" hidden field with the desired next value. */
export async function togglePoolMembership(formData: FormData) {
  const wantIn = formData.get("want_in") === "1";
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?redirect=/settings");

  await ensureProfileRow(supabase, user);

  const { error } = await supabase
    .from("profiles")
    .update({ in_player_pool: wantIn })
    .eq("id", user.id);
  if (error) {
    console.error("togglePoolMembership failed:", error);
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/pool");
  redirect(`/dashboard?settings_saved=${wantIn ? "pool_rejoined" : "pool_left"}`);
}
