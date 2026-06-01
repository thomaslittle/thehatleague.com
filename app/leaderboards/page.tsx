import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { LeaderboardsExplorer } from "@/components/leaderboards/leaderboards-explorer";
import { LiveLeaders } from "@/components/leaderboards/live-leaders";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import Link from "next/link";
import { getActiveSeason } from "@/lib/data/season";
import { loadSeasonLeaders, loadPointsLeaders } from "@/lib/data/stats";

export const metadata = {
  title: "Leaderboards",
  description:
    "Live Season 4 stat leaders plus the full Season 3 ledger. Filter by conference, sort by any stat.",
};

export default async function LeaderboardsPage() {
  const season = await getActiveSeason();
  const [liveRows, pointLeaders] = season
    ? await Promise.all([loadSeasonLeaders(season.id), loadPointsLeaders(season.id, 10)])
    : [[], []];
  const hasLive = liveRows.length > 0;
  const conferences = season?.conferences ?? [];

  return (
    <PageShell>
      <PageHero
        eyebrow={`${hasLive ? (season?.name ?? "Season 04") : "Season 03"} · Leaderboards`}
        title="Every hat,"
        accent="every stat."
        subtitle={
          hasLive ? (
            <>
              Live Season 4 stat leaders update as results come in. The full
              Season 3 ledger lives below.
            </>
          ) : (
            <>
              The full Season 3 ledger — all 60 players, all five categories.
              Live Season 4 leaders take over once matches are played.
            </>
          )
        }
      />

      {hasLive && season && (
        <section className="mx-auto max-w-[1320px] px-6 pb-12 md:px-10">
          <RealtimeRefresh tables={["player_stats", "point_events"]} channel="leaderboards" />
          <div className="mb-4 text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
            {season.name} · Live leaders
          </div>
          <LiveLeaders rows={liveRows} conferences={conferences} />

          {pointLeaders.length > 0 && (
            <div className="mt-6 rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Power players</h3>
                  <p className="text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase">
                    League points · clips, wins, MVPs &amp; more
                  </p>
                </div>
              </div>
              <ol className="mt-4 grid gap-1 sm:grid-cols-2">
                {pointLeaders.map((p, i) => (
                  <li key={p.profileId} className="flex items-center gap-3 rounded-lg border border-neutral-100 px-3 py-2 dark:border-neutral-900">
                    <span className="w-6 text-center text-lg font-bold text-thl-orange tabular-nums">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">
                      {p.username ? (
                        <Link href={`/players/${encodeURIComponent(p.username)}`} className="hover:text-thl-orange">
                          {p.name}
                        </Link>
                      ) : (
                        p.name
                      )}
                    </span>
                    <span className="text-lg font-bold tabular-nums">{p.points}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}

      <section className="mx-auto max-w-[1320px] px-6 pb-24 md:px-10">
        {hasLive && (
          <div className="mb-4 text-xs font-bold tracking-[0.28em] text-neutral-500 uppercase">
            Season 03 · Archive
          </div>
        )}
        <LeaderboardsExplorer />
      </section>
    </PageShell>
  );
}
