import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { ArrowRight } from "@/components/icons/brand";
import { StandingsTable } from "@/components/standings/standings-table";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { getActiveSeason } from "@/lib/data/season";
import {
  loadStandings,
  loadPowerRankings,
  loadSchedule,
  type StandingRow as LiveStandingRow,
} from "@/lib/data/tournament";
import {
  CHALLONGE_BRACKETS,
  FEDORA_PLAYOFFS_S3,
  FEDORA_S3,
  SOMBRERO_PLAYOFFS_S3,
  SOMBRERO_S3,
  type PlayoffRow,
  type StandingRow,
} from "@/lib/data/season3-standings";

export const metadata = {
  title: "Standings",
  description:
    "Season 3 final standings and playoff results across both conferences.",
};

const BRACKETS = [
  {
    label: "Sombrero · Regular season",
    href: CHALLONGE_BRACKETS.sombreroRegular,
    tag: "Regular" as const,
  },
  {
    label: "Fedora · Regular season",
    href: CHALLONGE_BRACKETS.fedoraRegular,
    tag: "Regular" as const,
  },
  {
    label: "Sombrero · Play-In",
    href: CHALLONGE_BRACKETS.playInSombrero,
    tag: "Play-in" as const,
  },
  {
    label: "Fedora · Play-In",
    href: CHALLONGE_BRACKETS.playInFedora,
    tag: "Play-in" as const,
  },
  {
    label: "Sombrero · Playoffs",
    href: CHALLONGE_BRACKETS.sombreroPlayoffs,
    tag: "Playoffs" as const,
  },
  {
    label: "Fedora · Playoffs",
    href: CHALLONGE_BRACKETS.fedoraPlayoffs,
    tag: "Playoffs" as const,
  },
];

function toSeasonRow(r: LiveStandingRow, seed: number): StandingRow {
  return { seed, name: r.name, captain: null, gp: r.gp, w: r.w, l: r.l, gf: r.gf, ga: r.ga };
}

export default async function StandingsPage() {
  const season = await getActiveSeason();
  const liveRows = season ? await loadStandings(season.id) : [];
  const power = season ? await loadPowerRankings(season.id) : null;
  const schedule = season ? await loadSchedule(season.id) : [];
  const playoffMatches = schedule.filter((m) => m.bracket);
  // Group live standings by conference for the S4 block.
  const liveByConf = new Map<string, LiveStandingRow[]>();
  for (const r of liveRows) {
    const key = r.conference ?? "League";
    if (!liveByConf.has(key)) liveByConf.set(key, []);
    liveByConf.get(key)!.push(r);
  }
  const hasLive = liveRows.length > 0;

  return (
    <PageShell>
      <PageHero
        eyebrow={`${season?.name ?? "Season 04"} · Standings`}
        title="Where it"
        accent="stands."
        subtitle={
          <>
            Live Season 4 tables up top, updated automatically as captains
            report results. Season 3&apos;s final receipts — both conferences
            and every playoff finish — are archived below.
          </>
        }
      />

      {/* Current season — live standings (always first) */}
      <section className="mx-auto max-w-[1320px] px-6 pt-2 pb-16 md:px-10">
        <RealtimeRefresh tables={["matches", "match_games"]} channel="standings" />
        <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
          {season?.name ?? "Season 04"} · Live standings
        </div>
        {hasLive ? (
          <>
            <h2 className="mt-2 text-2xl leading-tight font-bold tracking-tight md:text-3xl">
              This season, as it stands.
            </h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {[...liveByConf.entries()].map(([conf, rows]) => (
                <div
                  key={conf}
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <div className="border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
                    <div className="text-2xl font-bold tracking-tight md:text-3xl">{conf}</div>
                    <div className="mt-0.5 text-xs font-bold tracking-[0.2em] text-neutral-500 uppercase">
                      {rows.length} team{rows.length === 1 ? "" : "s"} · live
                    </div>
                  </div>
                  <div className="p-3">
                    <StandingsTable teams={rows.map((r, i) => toSeasonRow(r, i + 1))} compact />
                  </div>
                </div>
              ))}
            </div>

            {power && power.rows.length > 0 && (
              <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                      Power rankings · Week {power.week}
                    </div>
                    <h3 className="mt-1 text-xl font-bold tracking-tight">The committee&apos;s read</h3>
                  </div>
                  <Link href="/power-rankings" className="text-xs font-bold text-thl-orange hover:underline">
                    Full rankings <ArrowRight className="inline h-3.5 w-3.5" />
                  </Link>
                </div>
                <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                  {power.rows.slice(0, 6).map((r) => (
                    <li key={r.teamId} className="flex items-center gap-3 text-sm">
                      <span className="w-6 text-center text-lg font-bold text-thl-orange tabular-nums">{r.rank}</span>
                      <span className="min-w-0 flex-1 truncate font-semibold">{r.name}</span>
                      {r.movement != null && r.movement !== 0 && (
                        <span className={`text-xs font-bold ${r.movement > 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {r.movement > 0 ? "▲" : "▼"} {Math.abs(r.movement)}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Playoff bracket area */}
            <div className="mt-8">
              <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
                Playoffs
              </div>
              {playoffMatches.length > 0 ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {playoffMatches.map((m) => (
                    <Link
                      key={m.id}
                      href={`/matches/${m.id}`}
                      className="rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950"
                    >
                      <div className="text-[10px] font-bold tracking-[0.18em] text-thl-orange uppercase">
                        {m.bracket}
                        {m.roundLabel ? ` · ${m.roundLabel}` : ""}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm font-bold">
                        <span className="truncate">{m.home?.name ?? "TBD"}</span>
                        <span className="font-bold text-thl-orange tabular-nums">
                          {m.status === "final" ? `${m.homeScore}-${m.awayScore}` : "vs"}
                        </span>
                        <span className="truncate text-right">{m.away?.name ?? "TBD"}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-3 max-w-2xl text-sm text-neutral-500">
                  The bracket sets after the regular season — top teams from each conference
                  advance. Check back as playoffs approach.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-3xl border border-dashed border-neutral-300 bg-white p-8 md:p-12 dark:border-neutral-800 dark:bg-neutral-950">
            <h3 className="text-3xl font-bold tracking-[-0.02em] md:text-4xl">
              Live standings render here once Season 4 kicks off.
            </h3>
            <p className="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
              Teams form on draft night; standings update automatically as
              captains report results.
            </p>
            <Link
              href="/the-draft"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-thl-orange px-4 py-2.5 text-sm font-bold text-black hover:bg-thl-orange-deep"
            >
              See draft info <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* Past season — Season 3 final standings (archive) */}
      <section className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950">
        <div className="mx-auto max-w-[1320px] px-6 py-14 md:px-10 md:py-16">
          <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
            Season 03 · Final standings
          </div>
          <h2 className="mt-2 text-2xl leading-tight font-bold tracking-tight md:text-3xl">
            The receipts.
          </h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ConfBlock
              title="Sombrero Conference"
              sub="Western · 10 teams · S03"
              rows={SOMBRERO_S3}
              playoffs={SOMBRERO_PLAYOFFS_S3}
              regularHref={CHALLONGE_BRACKETS.sombreroRegular}
              playoffsHref={CHALLONGE_BRACKETS.sombreroPlayoffs}
              playInHref={CHALLONGE_BRACKETS.playInSombrero}
            />
            <ConfBlock
              title="Fedora Conference"
              sub="Eastern · 10 teams · S03"
              rows={FEDORA_S3}
              playoffs={FEDORA_PLAYOFFS_S3}
              regularHref={CHALLONGE_BRACKETS.fedoraRegular}
              playoffsHref={CHALLONGE_BRACKETS.fedoraPlayoffs}
              playInHref={CHALLONGE_BRACKETS.playInFedora}
            />
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 dark:border-neutral-900">
        <div className="mx-auto max-w-[1320px] px-6 py-14 md:px-10 md:py-16">
          <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
            Original brackets · Challonge
          </div>
          <h2 className="mt-2 text-2xl leading-tight font-bold tracking-tight md:text-3xl">
            Open any bracket in Challonge.
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {BRACKETS.map((b) => (
              <a
                key={b.href}
                href={b.href}
                target="_blank"
                rel="noopener"
                className="group flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-black"
              >
                <div>
                  <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                    {b.tag}
                  </div>
                  <div className="mt-0.5 text-sm font-bold">{b.label}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-thl-orange transition group-hover:translate-x-1" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function ConfBlock({
  title,
  sub,
  rows,
  playoffs,
  regularHref,
  playoffsHref,
  playInHref,
}: {
  title: string;
  sub: string;
  rows: StandingRow[];
  playoffs: PlayoffRow[];
  regularHref: string;
  playoffsHref: string;
  playInHref: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
        <div>
          <div className="text-2xl font-bold tracking-tight md:text-3xl">{title}</div>
          <div className="mt-1.5 text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
            {sub}
          </div>
        </div>
        <span className="rounded-md bg-thl-orange px-2.5 py-1 text-[10px] font-extrabold tracking-[0.18em] text-black">
          S03
        </span>
      </div>

      {/* Regular season table — click any column header to sort */}
      <StandingsTable teams={rows} />


      {/* Playoff results */}
      <div className="border-t border-neutral-200 bg-neutral-50/60 px-6 py-5 dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            Playoff finish
          </div>
          <span className="text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase">
            8 teams · double-elim
          </span>
        </div>
        <ol className="mt-3 grid gap-1.5">
          {playoffs.map((p, i) => (
            <li
              key={`${p.rank}-${p.name}`}
              className={`flex items-center gap-3 rounded-md px-2 py-1.5 text-sm ${
                i === 0
                  ? "bg-thl-orange/15 font-bold text-thl-orange"
                  : "text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <span className="w-6 text-center font-extrabold tabular-nums">
                {p.rank}
              </span>
              <span className="min-w-0 truncate">
                {i === 0 && "★ "}
                {p.name}
              </span>
              {p.captain && (
                <span className="ml-auto truncate text-xs text-neutral-500">
                  {p.captain}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 px-6 py-3 text-[11px] dark:border-neutral-800">
        <a
          href={regularHref}
          target="_blank"
          rel="noopener"
          className="font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          Regular season ↗
        </a>
        <a
          href={playInHref}
          target="_blank"
          rel="noopener"
          className="font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          Play-in ↗
        </a>
        <a
          href={playoffsHref}
          target="_blank"
          rel="noopener"
          className="font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          Playoffs ↗
        </a>
      </div>
    </div>
  );
}
