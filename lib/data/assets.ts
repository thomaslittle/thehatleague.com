import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AssetTargetType = "match" | "game" | "team" | "player";
export type AssetKind = "clip" | "image" | "replay" | "file";

export interface AssetView {
  id: string;
  kind: AssetKind;
  source: "link" | "upload";
  url: string;
  title: string | null;
  thumbnailUrl: string | null;
  mimeType: string | null;
  createdAt: string;
  uploader: { id: string; name: string; username: string | null };
  mine: boolean;
}

interface UploaderRow {
  discord_username: string | null;
  discord_global_name: string | null;
}

/** Approved assets attached to an entity, newest first. */
export async function loadAssets(
  targetType: AssetTargetType,
  targetId: string,
  viewerId: string | null,
): Promise<AssetView[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("assets")
    .select(
      "id, kind, source, url, title, thumbnail_url, mime_type, created_at, profile_id, profiles:profile_id(discord_username, discord_global_name)",
    )
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  return (data ?? []).map((a) => {
    const p = (a.profiles ?? null) as UploaderRow | null;
    return {
      id: a.id,
      kind: a.kind as AssetKind,
      source: a.source as "link" | "upload",
      url: a.url,
      title: a.title,
      thumbnailUrl: a.thumbnail_url,
      mimeType: a.mime_type,
      createdAt: a.created_at,
      uploader: {
        id: a.profile_id,
        name: p?.discord_global_name ?? p?.discord_username ?? "Player",
        username: p?.discord_username ?? null,
      },
      mine: viewerId !== null && viewerId === a.profile_id,
    };
  });
}
