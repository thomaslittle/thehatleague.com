import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { LeaderboardsExplorer } from "@/components/leaderboards/leaderboards-explorer";

export const metadata = {
  title: "Leaderboards",
  description:
    "All 60 Season 3 players, ranked. Filter by conference, sort by any stat, search by name.",
};

export default function LeaderboardsPage() {
  return (
    <PageShell>
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
    </PageShell>
  );
}
