import { requireAdmin } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeason } from "@/lib/data/season";
import { loadDraftSnapshot, loadAvailablePool } from "@/lib/data/draft";
import { loadOverlaySettings } from "@/lib/data/overlay";
import { siteOrigin } from "@/lib/origin";
import { DraftControlRoom } from "@/components/admin/draft-control-room";

export const metadata = {
  title: "Draft control room",
  robots: { index: false, follow: false },
};

export default async function AdminDraftPage() {
  await requireAdmin("/admin/draft");
  const season = await getActiveSeason();

  if (!season) {
    return (
      <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-10">
        <h1 className="text-3xl font-bold tracking-tight">No season yet</h1>
        <p className="mt-3 text-neutral-500">
          Create a season before running a draft.
        </p>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const [snapshot, pool, { count }, overlay, origin] = await Promise.all([
    loadDraftSnapshot(supabase, season.id),
    loadAvailablePool(supabase, season.id),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_captain", true),
    loadOverlaySettings(supabase, season.id),
    siteOrigin(),
  ]);

  return (
    <DraftControlRoom
      seasonId={season.id}
      seasonName={season.name}
      seasonSlug={season.slug}
      initialSnapshot={snapshot}
      initialPool={pool}
      captainCount={count ?? 0}
      initialOverlay={overlay}
      origin={origin}
    />
  );
}
