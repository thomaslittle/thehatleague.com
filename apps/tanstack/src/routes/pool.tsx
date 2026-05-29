import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { ArrowRight, DiscordIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { PoolBoard, type SortKey } from "@/components/pool-board";
import { getFullPool } from "@/server/pool";
import { ogMeta } from "@/lib/og";

type RoleFilter = "everyone" | "captains" | "players";
const SORT_KEYS: SortKey[] = ["peak", "rank_3v3", "rank_2v2", "joined"];

export const Route = createFileRoute("/pool")({
  component: PoolPage,
  loader: () => getFullPool(),
  validateSearch: (search: Record<string, unknown>) => {
    const out: { sort?: SortKey; role?: RoleFilter; q?: string } = {};
    if (
      typeof search.sort === "string" &&
      (SORT_KEYS as string[]).includes(search.sort)
    ) {
      out.sort = search.sort as SortKey;
    }
    if (
      search.role === "captains" ||
      search.role === "players" ||
      search.role === "everyone"
    ) {
      out.role = search.role;
    }
    if (typeof search.q === "string" && search.q.length > 0) {
      out.q = search.q;
    }
    return out;
  },
  head: () => ({
    meta: ogMeta({
      title: "Player pool · The Hat League",
      description:
        "Every player currently in The Hat League Season 4 player pool — ranks, captains, and recent sign-ups.",
      dynamic: true,
    }),
  }),
});

function PoolPage() {
  const rows = Route.useLoaderData();
  const { viewer } = useLoaderData({ from: "__root__" });
  const { sort, role, q } = Route.useSearch();

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="flex-1">
        <section className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-900">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(247,97,3,0.28), transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-20">
            <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
              Player pool · Season 04
            </div>
            <h1 className="mt-4 text-5xl font-bold tracking-[-0.04em] md:text-6xl">
              {rows.length}{" "}
              <span className="font-marker font-normal text-thl-orange">
                hat dads
              </span>{" "}
              in the lobby.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
              Every player who&apos;s signed up for Season 4. Captains will
              draft from this board live on stream. New sign-ups land here
              within seconds.
            </p>
            {!viewer && (
              <div className="mt-8">
                <Link
                  to="/signin"
                  className="inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3.5 font-bold text-black transition hover:bg-thl-orange-deep"
                >
                  <DiscordIcon className="h-5 w-5" />
                  Add yourself
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        <PoolBoard
          initialRows={rows}
          initialSort={sort ?? "peak"}
          initialRole={role ?? "everyone"}
          initialQuery={q ?? ""}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
