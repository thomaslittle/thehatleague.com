import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeason, getSeasonBySlug } from "@/lib/data/season";
import { loadDraftSnapshot, loadAvailablePool, type DraftSnapshot, type DraftPerson } from "@/lib/data/draft";
import { loadOverlaySettings, type OverlaySettingsView } from "@/lib/data/overlay";

export interface OverlayContext {
  seasonId: string;
  settings: OverlaySettingsView;
  snapshot: DraftSnapshot;
  pool: DraftPerson[];
}

type RawParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Resolve + token-gate an overlay request. Returns null (→ render blank) when
 * the season/settings are missing or the `?token=` doesn't match the season's
 * `overlay_token`. OBS has no auth cookies, so the token IS the auth.
 */
export async function resolveOverlay(params: RawParams): Promise<OverlayContext | null> {
  const token = first(params.token);
  if (!token) return null;

  const seasonSlug = first(params.season);
  const season = seasonSlug ? await getSeasonBySlug(seasonSlug) : await getActiveSeason();
  if (!season) return null;

  const supabase = await createSupabaseServerClient();
  const settings = await loadOverlaySettings(supabase, season.id);
  if (!settings || settings.token !== token) return null;

  const [snapshot, pool] = await Promise.all([
    loadDraftSnapshot(supabase, season.id),
    loadAvailablePool(supabase, season.id),
  ]);

  return { seasonId: season.id, settings, snapshot, pool };
}
