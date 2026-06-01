"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeason } from "@/lib/data/season";
import { awardPoints, POINT_VALUES } from "@/lib/awards/points";
import type { AssetKind, AssetTargetType } from "@/lib/data/assets";

export interface AssetActionState {
  ok?: boolean;
  assetId?: string;
  error?: string;
}

/**
 * Attach a clip/asset (link or uploaded file) to a match, game, team, or player.
 * The `submit_asset` RPC validates the target and inserts as the caller; clip
 * submissions earn league points (idempotent per asset).
 */
export async function submitAsset(input: {
  kind: AssetKind;
  source: "link" | "upload";
  url: string;
  storagePath?: string | null;
  title?: string | null;
  thumbnailUrl?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  targetType: AssetTargetType;
  targetId: string;
}): Promise<AssetActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to submit." };

  const url = input.url.trim();
  if (!/^https?:\/\//i.test(url)) return { error: "A valid URL is required (https://…)." };

  const season = await getActiveSeason();
  // Supabase's type generator marks nullable RPC params as non-null; these
  // columns accept null at runtime, so cast the optional ones.
  const { data, error } = await supabase.rpc("submit_asset", {
    p_kind: input.kind,
    p_source: input.source,
    p_url: url,
    p_storage_path: (input.storagePath ?? null) as string,
    p_title: ((input.title ?? "").trim() || null) as string,
    p_thumbnail_url: (input.thumbnailUrl ?? null) as string,
    p_mime_type: (input.mimeType ?? null) as string,
    p_size_bytes: (input.sizeBytes ?? null) as number,
    p_target_type: input.targetType,
    p_target_id: input.targetId,
    p_season_id: (season?.id ?? null) as string,
  });
  if (error) return { error: error.message };

  const assetId = data as string;
  if (input.kind === "clip") {
    await awardPoints(supabase, {
      profileId: user.id,
      seasonId: season?.id ?? null,
      source: "clip",
      points: POINT_VALUES.clip,
      refType: "clip",
      refId: assetId,
    });
  }
  return { ok: true, assetId };
}

/** Delete an asset (author or league-ops, enforced by RLS) and its uploaded file. */
export async function deleteAsset(id: string): Promise<AssetActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in first." };

  const { data: asset } = await supabase
    .from("assets")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("assets").delete().eq("id", id);
  if (error) return { error: error.message };

  if (asset?.storage_path) {
    await supabase.storage.from("league-assets").remove([asset.storage_path]);
  }
  return { ok: true };
}
