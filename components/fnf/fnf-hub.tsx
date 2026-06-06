import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Swords, Trophy, Users } from "lucide-react";
import { RankBadge } from "@/components/ranks/rank-badge";
import { HallOfChampions, AllTimeStats } from "@/components/fnf/fnf-records";
import type {
  FnfChampionEntry,
  FnfAllTimeStat,
  FnfHubStats,
} from "@/lib/data/fnf";

/**
 * The Friday Nite Fights "hub" — what visitors land on between tournaments.
 * Leads with the reigning champions, then the running tally, all-time leaders,
 * and the hall of champions, and closes on how-it-works. The previous bracket
 * is one click away (the "Relive the bracket" CTA → ?id=) rather than dumped
 * up front.
 */
export function FnfHub({
  reigning,
  history,
  allTime,
  stats,
}: {
  reigning: FnfChampionEntry | null;
  history: FnfChampionEntry[];
  allTime: FnfAllTimeStat[];
  stats: FnfHubStats;
}) {
  return (
    <div className="mx-auto max-w-[1320px] space-y-12 px-6 pb-24 md:px-10 md:space-y-16">
      {reigning?.champions && (
        <ReigningChampions entry={reigning} />
      )}

      <StatStrip stats={stats} />

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <AllTimeStats stats={allTime} />
        <HallOfChampions history={history} />
      </div>

      <HowItWorks />
    </div>
  );
}

/** The showpiece: the most recent FNF winners — a compact, brand-orange band
 *  with the champions shown as a tight row and a CTA into their bracket. */
function ReigningChampions({ entry }: { entry: FnfChampionEntry }) {
  const team = entry.champions!;
  const bracketHref = `/friday-nite-fights?id=${entry.tournamentId}`;
  const date = entry.date
    ? new Date(entry.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-thl-orange/30 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black p-6 shadow-xl shadow-black/30 md:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:22px_22px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-thl-orange/15 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: title + champions */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.24em] text-thl-orange uppercase">
              <Trophy className="size-3.5 text-amber-400" /> Reigning champions
            </span>
            {date && (
              <span className="text-[11px] font-semibold text-neutral-500">
                {date}
              </span>
            )}
          </div>

          <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            {team.name}
          </h2>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {team.members.map((p) => {
              const inner = (
                <>
                  <span className="relative size-9 shrink-0 overflow-hidden rounded-full ring-2 ring-amber-400/80">
                    {p.avatarUrl ? (
                      <Image
                        src={p.avatarUrl}
                        alt={p.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-neutral-800 text-[11px] font-bold text-neutral-300">
                        {p.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">
                      {p.name}
                    </span>
                    {p.rankValue && (
                      <RankBadge
                        value={p.rankValue}
                        size={13}
                        abbreviate
                        textClassName="text-[11px] font-semibold text-neutral-400"
                      />
                    )}
                  </span>
                </>
              );
              return p.username ? (
                <Link
                  key={p.id}
                  href={`/players/${encodeURIComponent(p.username)}`}
                  className="group/champ inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pr-4 pl-1.5 transition hover:border-thl-orange/50 hover:bg-white/[0.07]"
                >
                  {inner}
                </Link>
              ) : (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pr-4 pl-1.5"
                >
                  {inner}
                </span>
              );
            })}
          </div>

          {entry.runnerUp && (
            <p className="mt-3 text-xs text-neutral-500">
              <span className="font-semibold text-neutral-400">Runner-up:</span>{" "}
              {entry.runnerUp.name} —{" "}
              {entry.runnerUp.members.map((m) => m.name).join(" & ")}
            </p>
          )}
        </div>

        {/* Right: CTA */}
        <Link
          href={bracketHref}
          className="group/cta inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-thl-orange to-amber-500 px-6 text-sm font-bold text-black shadow-lg shadow-thl-orange/25 transition hover:-translate-y-0.5 hover:shadow-xl lg:self-auto"
        >
          <Trophy className="size-4" />
          Relive the bracket
          <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

/** Running all-time tally rendered as big marker numbers. */
function StatStrip({ stats }: { stats: FnfHubStats }) {
  const items = [
    { label: "Tournaments", value: stats.tournaments },
    { label: "Fighters", value: stats.fighters },
    { label: "Games played", value: stats.games },
  ];
  return (
    <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-thl-orange/[0.07] via-white to-white px-6 py-8 md:px-10 dark:border-neutral-800 dark:from-thl-orange/[0.1] dark:via-neutral-950 dark:to-neutral-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,rgba(247,97,3,0.12)_1px,transparent_0)] [background-size:22px_22px]"
      />
      <div className="relative grid grid-cols-3 gap-4 text-center">
        {items.map((it) => (
          <div key={it.label}>
            <div className="font-marker text-4xl leading-none text-thl-orange md:text-6xl">
              {it.value.toLocaleString()}
            </div>
            <div className="mt-2 text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase md:text-xs md:tracking-[0.24em]">
              {it.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Evergreen format explainer + Discord CTA for the between-tournaments state. */
function HowItWorks() {
  const steps = [
    {
      icon: Users,
      title: "Connect Discord",
      body: "Sign in and enter before kickoff — no team needed.",
    },
    {
      icon: Swords,
      title: "Auto-balanced 2v2",
      body: "We pair you by rank into even teams the moment registration locks.",
    },
    {
      icon: Trophy,
      title: "Swiss into playoffs",
      body: "Battle the Swiss rounds; the top seeds fight it out for the hat.",
    },
  ];
  return (
    <section className="relative overflow-hidden rounded-3xl border border-thl-orange/30 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black p-7 md:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-20 size-72 rounded-full bg-thl-orange/20 blur-3xl"
      />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <div className="text-[10px] font-bold tracking-[0.28em] text-thl-orange uppercase">
            Every Friday · 2v2
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Back in the ring{" "}
            <span className="font-marker font-normal text-thl-orange">
              this Friday.
            </span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-300 md:text-base">
            Friday Nite Fights runs every week. Watch the channel for kickoff —
            when registration opens, this page becomes your lobby.
          </p>
          <Link
            href="/friday-nite-fights"
            className="group mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-thl-orange to-amber-500 px-6 text-sm font-bold text-white shadow-lg shadow-thl-orange/30 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Swords className="size-4" />
            Enter the next fight
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ol className="grid gap-3 sm:grid-cols-3 lg:max-w-xl">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-center gap-2 text-thl-orange">
                <span className="grid size-7 place-items-center rounded-lg bg-thl-orange/15 text-xs font-extrabold tabular-nums">
                  {i + 1}
                </span>
                <s.icon className="size-4" />
              </div>
              <div className="mt-3 text-sm font-bold text-white">{s.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
