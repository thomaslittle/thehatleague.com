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

/** Render order + display labels for the patch categories. Anything not listed
 *  falls through to a "More" group so new categories never disappear. */
const CATEGORY_ORDER: { key: string; label: string }[] = [
  { key: "fnf", label: "Friday Nite Fights" },
  { key: "performance", label: "Match performance" },
  { key: "season", label: "Season honors" },
  { key: "milestone", label: "Milestones" },
  { key: "special", label: "Special" },
];

export default async function PatchesPage() {
  const patches = await loadBadgeCatalog();

  // Group by category, preserving the catalog's tier sort within each group.
  const byCategory = new Map<string, BadgeCatalogRow[]>();
  for (const p of patches) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }
  const known = new Set(CATEGORY_ORDER.map((c) => c.key));
  const groups = [
    ...CATEGORY_ORDER.map((c) => ({
      label: c.label,
      items: byCategory.get(c.key) ?? [],
    })),
    {
      label: "More",
      items: [...byCategory.entries()]
        .filter(([k]) => !known.has(k))
        .flatMap(([, v]) => v),
    },
  ].filter((g) => g.items.length > 0);

  return (
    <PageShell>
      <PageHero
        eyebrow="The hatband"
        title="Stitch your"
        accent="hat."
        subtitle={
          <>
            Patches unlock as the season unfolds — first wins, hat tricks, brick
            walls, Friday Nite Fights titles, season milestones. Earn them, wear
            them on your profile.
          </>
        }
      />
      <section className="mx-auto max-w-[1320px] space-y-12 px-6 pb-24 md:px-10">
        <RealtimeRefresh tables={["player_badges"]} channel="patches" />
        {groups.map((g) => (
          <div key={g.label}>
            <h2 className="mb-4 flex items-center gap-3 text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
              {g.label}
              <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
              <span className="text-[10px] text-neutral-400">
                {g.items.length}
              </span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((p) => (
                <PatchCard key={p.id} patch={p} />
              ))}
            </div>
          </div>
        ))}
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
