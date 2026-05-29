import { createFileRoute } from "@tanstack/react-router";
import { LeaderboardsExplorer } from "@/components/leaderboards-explorer";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { ogMeta } from "@/lib/og";

export const Route = createFileRoute("/leaderboards")({
  component: LeaderboardsPage,
  head: () => ({
    meta: ogMeta({
      title: "Leaderboards · The Hat League",
      description:
        "All 60 Season 3 players, ranked. Filter by conference, sort by any stat, search by name.",
      dynamic: true,
    }),
  }),
});

function LeaderboardsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="flex-1">
        <PageHero
          eyebrow="Season 03 · Leaderboards"
          title="Every hat,"
          accent="every stat."
          subtitle={
            <>
              The full Season 3 ledger — all 60 players, all five categories.
              Filter by conference, sort by any stat, search by name. Numbers
              stop refreshing once Season 4 starts and a fresh table takes
              over.
            </>
          }
        />

        <section className="mx-auto max-w-[1320px] px-6 pb-24 md:px-10">
          <LeaderboardsExplorer />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
