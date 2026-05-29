import { Suspense } from "react";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { HeroStats } from "@/components/page/hero-stats";
import { SessionCta } from "@/components/page/session-cta";
import { PoolAvatarStack } from "@/components/landing/pool-avatar-stack";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getViewer, getPoolStats, getPoolAvatars } from "@/lib/auth/viewer";
import { PoolBoard, type SortKey, type ViewKey } from "@/components/pool/pool-board";
import { POOL_SELECT, type PoolRow } from "@/lib/data/pool";

export const metadata = {
  title: "Player pool",
  description:
    "Every player who's signed up for The Hat League Season 4 draft, ordered by rank.",
};

type RoleFilter = "everyone" | "captains" | "players";

export default async function PoolPage(props: PageProps<"/pool">) {
  const sp = await props.searchParams;
  const sort: SortKey =
    sp.sort === "rank_3v3" ||
    sp.sort === "rank_2v2" ||
    sp.sort === "joined"
      ? sp.sort
      : "peak";
  const role: RoleFilter =
    sp.role === "captains" || sp.role === "players" ? sp.role : "everyone";
  const view: ViewKey = sp.view === "grid" ? "grid" : "list";
  const query = typeof sp.q === "string" ? sp.q : "";

  const [viewer, stats, poolAvatars] = await Promise.all([
    getViewer(),
    getPoolStats(),
    getPoolAvatars(),
  ]);

  return (
    <PageShell>
      <PageHero
        eyebrow="Player pool · Season 04"
        title="Everyone in the lobby."
        accent="Pre-draft."
        subtitle={
          <>
            Every player who&apos;s signed up and confirmed their ranks. This
            list updates live — search by name, filter by role, or sort it
            any way you want.
          </>
        }
        actions={<SessionCta viewer={viewer} signedOutLabel="Add yourself" />}
        aside={
          <div className="flex flex-col gap-5">
            <HeroStats
              poolCount={stats.poolCount}
              captainCount={stats.captainCount}
            />
            {poolAvatars.length > 0 && (
              <PoolAvatarStack
                avatars={poolAvatars}
                count={stats.poolCount}
                max={10}
                className="max-w-full"
              />
            )}
          </div>
        }
      />
      <Suspense fallback={<PoolBoardSkeleton />}>
        <PoolBoardLoader sort={sort} role={role} query={query} view={view} />
      </Suspense>
    </PageShell>
  );
}

async function PoolBoardLoader({
  sort,
  role,
  query,
  view,
}: {
  sort: SortKey;
  role: RoleFilter;
  query: string;
  view: ViewKey;
}) {
  const supabase = await createSupabaseServerClient();
  const [{ data: players }, viewer] = await Promise.all([
    supabase.from("profiles").select(POOL_SELECT).eq("in_player_pool", true),
    getViewer(),
  ]);
  const initialRows: PoolRow[] = (players ?? []) as PoolRow[];

  return (
    <PoolBoard
      initialRows={initialRows}
      sort={sort}
      role={role}
      query={query}
      view={view}
      viewerAuthed={!!viewer?.isAuthenticated}
      viewerInPool={!!viewer?.inPool}
    />
  );
}

function PoolBoardSkeleton() {
  return (
    <>
      <section className="mx-auto max-w-[1320px] px-6 pb-10 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index}>
                <div className="h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="mt-2 h-7 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-8 w-24 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-6 pb-24 md:px-10">
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <li
              key={index}
              className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="grid flex-1 gap-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="h-12 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-12 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-12 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
