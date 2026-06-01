import Link from "next/link";
import type { ReactNode } from "react";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { getActiveSeason } from "@/lib/data/season";
import { getRecentAnnouncements } from "@/lib/data/announcements";
import { loadPowerRankings } from "@/lib/data/tournament";
import { loadSeasonLeaders, loadPointsLeaders } from "@/lib/data/stats";

export const metadata = {
  title: "League hub",
  description: "The Hat League newsroom — recaps, power rankings, and stat leaders in one place.",
};

export default async function HubPage() {
  const season = await getActiveSeason();
  const [news, power, leaders, pointLeaders] = await Promise.all([
    getRecentAnnouncements(6),
    season ? loadPowerRankings(season.id) : Promise.resolve(null),
    season ? loadSeasonLeaders(season.id) : Promise.resolve([]),
    season ? loadPointsLeaders(season.id, 5) : Promise.resolve([]),
  ]);

  const topScorers = [...leaders].sort((a, b) => b.score - a.score).slice(0, 5);
  const playerOfWeek = topScorers[0] ?? null;
  const hasPower = Boolean(power && power.rows.length > 0);

  return (
    <PageShell>
      <PageHero
        eyebrow={`${season?.name ?? "Season 04"} · League hub`}
        title="The newsroom."
        accent="All in one place."
        subtitle={
          <>
            Recaps, power rankings, and who&apos;s lighting it up — the pulse of
            the league, updated live.
          </>
        }
      />

      <section className="mx-auto grid max-w-[1320px] gap-8 px-6 pb-24 md:px-10 lg:grid-cols-[1.7fr_minmax(300px,1fr)]">
        <RealtimeRefresh
          tables={["announcements", "power_rankings", "player_stats", "point_events"]}
          channel="hub"
        />

        {/* MAIN — the league pulse */}
        <div className="space-y-6">
          {playerOfWeek ? (
            <div className="relative overflow-hidden rounded-3xl border border-thl-orange/40 bg-gradient-to-br from-thl-orange/10 via-transparent to-transparent p-6 md:p-8">
              <div className="text-[10px] font-bold tracking-[0.24em] text-thl-orange uppercase">
                Player to watch
              </div>
              <div className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                {playerOfWeek.name}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <PulseStat label="Goals" value={playerOfWeek.goals} />
                <PulseStat label="Assists" value={playerOfWeek.assists} />
                <PulseStat label="Saves" value={playerOfWeek.saves} />
                <PulseStat label="Score" value={playerOfWeek.score} />
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border border-thl-orange/40 bg-gradient-to-br from-thl-orange/10 via-transparent to-transparent p-6 md:p-8">
              <div className="text-[10px] font-bold tracking-[0.24em] text-thl-orange uppercase">
                The pulse
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                Season 4 is warming up.
              </h2>
              <p className="mt-2 max-w-md text-sm text-neutral-500">
                Player to watch, power rankings and stat leaders light up here
                once the draft fills out rosters and games get played.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <PulsePill href="/pool">Player pool</PulsePill>
                <PulsePill href="/the-draft">The draft</PulsePill>
                <PulsePill href="/schedule">Schedule</PulsePill>
              </div>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <PulseCard heading="Power rankings" href="/power-rankings" hrefLabel="Full list">
              {hasPower ? (
                <ol className="space-y-2">
                  {power!.rows.slice(0, 5).map((r) => (
                    <li key={r.teamId} className="flex items-center gap-3 text-sm">
                      <RankNum n={r.rank} />
                      <span className="min-w-0 flex-1 truncate font-semibold">{r.name}</span>
                      {r.movement != null && r.movement !== 0 && (
                        <span className={`text-xs font-bold ${r.movement > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                          {r.movement > 0 ? "▲" : "▼"} {Math.abs(r.movement)}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <PulseEmpty>Rankings publish once the season tips off.</PulseEmpty>
              )}
            </PulseCard>

            <PulseCard heading="Stat leaders" href="/leaderboards" hrefLabel="All stats">
              {topScorers.length > 0 ? (
                <ol className="space-y-2">
                  {topScorers.map((p, i) => (
                    <li key={p.profileId} className="flex items-center gap-3 text-sm">
                      <RankNum n={i + 1} />
                      <span className="min-w-0 flex-1 truncate font-semibold">{p.name}</span>
                      <span className="font-bold tabular-nums">{p.score}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <PulseEmpty>No stats yet — check back after week 1.</PulseEmpty>
              )}
            </PulseCard>
          </div>

          <PulseCard heading="Power players" sub="League points" href="/leaderboards" hrefLabel="Leaderboard">
            {pointLeaders.length > 0 ? (
              <ol className="space-y-2">
                {pointLeaders.map((p, i) => (
                  <li key={p.profileId} className="flex items-center gap-3 text-sm">
                    <RankNum n={i + 1} />
                    <span className="min-w-0 flex-1 truncate font-semibold">
                      {p.username ? (
                        <Link href={`/players/${encodeURIComponent(p.username)}`} className="hover:text-thl-orange">
                          {p.name}
                        </Link>
                      ) : (
                        p.name
                      )}
                    </span>
                    <span className="font-bold tabular-nums">{p.points}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <PulseEmpty>Earn points across the season to climb the board.</PulseEmpty>
            )}
          </PulseCard>
        </div>

        {/* RAIL — latest announcements */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Latest</h2>
            <Link href="/announcements" className="text-xs font-bold text-thl-orange hover:underline">
              All news →
            </Link>
          </div>

          {news.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
              No posts yet.
            </div>
          ) : (
            <div className="space-y-3">
              {news.map((a, i) =>
                i === 0 ? (
                  <Link
                    key={a.id}
                    href={`/announcements/${a.slug}`}
                    className="block rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase">
                      {a.pinned && (
                        <span className="rounded bg-thl-orange/15 px-1.5 py-0.5 text-thl-orange">Pinned</span>
                      )}
                      <span className="text-neutral-400">{a.kind ?? "news"}</span>
                    </div>
                    <h3 className="mt-2 text-lg leading-snug font-bold tracking-tight">{a.title}</h3>
                    {a.body && (
                      <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{a.body}</p>
                    )}
                    <span className="mt-3 inline-block text-xs font-bold text-thl-orange">Read →</span>
                  </Link>
                ) : (
                  <Link
                    key={a.id}
                    href={`/announcements/${a.slug}`}
                    className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-thl-orange" />
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
                        {a.pinned ? "Pinned · " : ""}
                        {a.kind ?? "news"}
                      </span>
                      <span className="mt-0.5 block truncate text-sm font-semibold">{a.title}</span>
                    </span>
                  </Link>
                ),
              )}
            </div>
          )}
        </aside>
      </section>
    </PageShell>
  );
}

function PulseCard({
  heading,
  sub,
  href,
  hrefLabel,
  children,
}: {
  heading: string;
  sub?: string;
  href?: string;
  hrefLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight">{heading}</h3>
          {sub && (
            <p className="text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase">
              {sub}
            </p>
          )}
        </div>
        {href && (
          <Link href={href} className="shrink-0 text-xs font-bold text-thl-orange hover:underline">
            {hrefLabel ?? "View"} →
          </Link>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function RankNum({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-thl-orange/15 text-xs font-extrabold text-thl-orange tabular-nums">
      {n}
    </span>
  );
}

function PulseStat({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 text-center dark:border-neutral-800 dark:bg-neutral-950/60">
      <span className="block text-xl font-bold tabular-nums">{value}</span>
      <span className="block text-[9px] font-bold tracking-[0.16em] text-neutral-500 uppercase">
        {label}
      </span>
    </span>
  );
}

function PulsePill({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-semibold transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-800"
    >
      {children} →
    </Link>
  );
}

function PulseEmpty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-neutral-500">{children}</p>;
}
