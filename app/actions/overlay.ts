"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Overlay-settings server actions. League-ops gated; overlays read the result
 * in real time via Realtime, so the streamer drives the broadcast from
 * `/admin/draft` and OBS reacts instantly.
 */

export interface OverlayActionState {
  ok?: boolean;
  error?: string;
  token?: string;
}

type SupabaseServer = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function leagueOps(): Promise<
  { ok: true; supabase: SupabaseServer } | { ok: false; error: string }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You need to sign in." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return { ok: false, error: "League ops only." };
  return { ok: true, supabase };
}

/** Create the season's overlay-settings row if missing; returns the token. */
export async function ensureOverlaySettings(seasonId: string): Promise<OverlayActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const { data: existing } = await supabase
    .from("overlay_settings")
    .select("overlay_token")
    .eq("season_id", seasonId)
    .maybeSingle();
  if (existing) return { ok: true, token: existing.overlay_token };

  const { data, error } = await supabase
    .from("overlay_settings")
    .insert({ season_id: seasonId })
    .select("overlay_token")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/admin/draft");
  return { ok: true, token: data.overlay_token };
}

export interface OverlayPatch {
  active_scene?: string;
  theme?: string;
  show_timer?: boolean;
  show_recent_picks?: boolean;
  show_on_deck?: boolean;
  reveal_seconds?: number;
  reveal_sound?: boolean;
  lower_third?: string | null;
  ticker_text?: string | null;
  accent?: string | null;
}

export async function updateOverlaySettings(
  seasonId: string,
  patch: OverlayPatch,
): Promise<OverlayActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  // Upsert so the first write also creates the row.
  const { error } = await supabase
    .from("overlay_settings")
    .upsert({ season_id: seasonId, ...patch }, { onConflict: "season_id" });
  if (error) return { error: error.message };

  revalidatePath("/admin/draft");
  return { ok: true };
}

/** Switch the active scene the `/overlay/scene` director renders. */
export async function setActiveScene(seasonId: string, scene: string): Promise<OverlayActionState> {
  return updateOverlaySettings(seasonId, { active_scene: scene });
}
