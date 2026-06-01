import { resolveOverlay } from "@/lib/overlay/gate";
import { loadLatestBadgeUnlock } from "@/lib/data/awards";
import { PatchUnlockWidget } from "@/components/overlay/patch-unlock";

export const dynamic = "force-dynamic";

export default async function PatchUnlockOverlay(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await resolveOverlay(await props.searchParams);
  if (!ctx) return null;
  const latest = await loadLatestBadgeUnlock(ctx.seasonId);
  return <PatchUnlockWidget latest={latest} />;
}
