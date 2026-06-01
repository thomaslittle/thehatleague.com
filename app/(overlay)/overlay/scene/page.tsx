import { resolveOverlay } from "@/lib/overlay/gate";
import { SceneWidget } from "@/components/overlay/widgets";

export const dynamic = "force-dynamic";

export default async function OverlayPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await resolveOverlay(await props.searchParams);
  if (!ctx) return null;
  return (
    <SceneWidget
      seasonId={ctx.seasonId}
      snapshot={ctx.snapshot}
      settings={ctx.settings}
      pool={ctx.pool}
    />
  );
}
