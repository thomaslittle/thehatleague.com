import Link from "next/link";
import { ArrowRight } from "@/components/icons/brand";
import type { LeagueEvent } from "@/lib/data/events";

/**
 * Landing "upcoming events" strip: the Season 4 milestone sequence
 * (Combine → Draft → Kickoff). Dates are TBA until the schedule firms up,
 * so this renders as a clean numbered roadmap rather than a live countdown.
 */
export function UpcomingEvents({ events }: { events: LeagueEvent[] }) {
  if (events.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-thl-orange/[0.07] via-white to-white p-6 md:p-8 dark:border-neutral-800 dark:from-thl-orange/[0.1] dark:via-neutral-950 dark:to-neutral-950">
        {/* Texture: dotted grid + a soft orange corner glow. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,rgba(247,97,3,0.12)_1px,transparent_0)] [background-size:22px_22px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-thl-orange/15 blur-3xl"
        />

        <div className="relative flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold tracking-[0.28em] text-thl-orange uppercase">
              Upcoming events
            </div>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight md:text-3xl">
              The road to{" "}
              <span className="font-marker font-normal text-thl-orange">Season 4.</span>
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-neutral-500 uppercase backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/70">
            <span className="h-1.5 w-1.5 rounded-full bg-thl-orange" />
            Dates TBA
          </span>
        </div>

        <ol className="relative mt-6 grid gap-4 md:grid-cols-3">
          {events.map((e, i) => (
            <li key={e.key}>
              <Link
                href={e.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-thl-orange hover:shadow-[0_22px_45px_-22px_rgba(247,97,3,0.55)] dark:border-neutral-800 dark:bg-neutral-900/50"
              >
                {/* Top accent bar that wipes in on hover. */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-thl-orange transition-transform duration-300 group-hover:scale-x-100"
                />
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-thl-orange/15 text-sm font-extrabold text-thl-orange tabular-nums transition-all duration-300 group-hover:scale-110 group-hover:bg-thl-orange group-hover:text-black">
                    {i + 1}
                  </span>
                  <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-[9px] font-bold tracking-[0.18em] text-neutral-400 uppercase transition group-hover:border-thl-orange/40 group-hover:text-thl-orange dark:border-neutral-700">
                    TBA
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold tracking-tight transition-colors group-hover:text-thl-orange">
                  {e.label}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">{e.blurb}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-thl-orange opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                  Details <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
