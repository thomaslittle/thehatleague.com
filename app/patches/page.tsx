import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { PatchIcon } from "@/components/patches/patch-icon";
import { loadBadgeCatalog, type BadgeCatalogRow } from "@/lib/data/awards";

export const metadata = {
  title: "Patches",
  description:
    "Every Hat League patch — earn them through wins, stats, and milestones, and stitch them on your hat.",
};

const TIER_RING: Record<string, string> = {
  bronze: "border-amber-700/40",
  silver: "border-neutral-400/50",
  gold: "border-yellow-500/50",
  legendary: "border-thl-orange/60",
};

export default async function PatchesPage() {
  const patches = await loadBadgeCatalog();

  return (
    <PageShell>
      <PageHero
        eyebrow="The hatband"
        title="Stitch your"
        accent="hat."
        subtitle={
          <>
            Patches unlock as the season unfolds — first wins, hat tricks, brick
            walls, season milestones. Earn them, wear them on your profile.
          </>
        }
      />
      <section className="mx-auto max-w-[1320px] px-6 pb-24 md:px-10">
        <RealtimeRefresh tables={["player_badges"]} channel="patches" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patches.map((p) => (
            <PatchCard key={p.id} patch={p} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function PatchCard({ patch }: { patch: BadgeCatalogRow }) {
  return (
    <div
      className={`flex items-start gap-4 rounded-2xl border-2 bg-white p-5 dark:bg-neutral-950 ${
        TIER_RING[patch.tier] ?? "border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-thl-orange/10 text-thl-orange">
        <PatchIcon name={patch.icon} className="h-7 w-7" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold tracking-tight">{patch.name}</h3>
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.16em] text-neutral-500 uppercase dark:bg-neutral-900">
            {patch.tier}
          </span>
        </div>
        {patch.description && <p className="mt-1 text-sm text-neutral-500">{patch.description}</p>}
        <p className="mt-2 text-xs font-bold text-thl-orange">{patch.earnedCount} earned</p>
      </div>
    </div>
  );
}
