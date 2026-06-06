"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/icons/brand";

/**
 * Recurring weekly-event countdown for the landing page. Computes the next
 * occurrence of each weekly event (in ET) and counts down to whichever is
 * soonest — so today it points at SH*T Faced Saturday, and once that night
 * wraps it rolls itself over to next Friday's Friday Nite Fights. During the
 * event's window it flips to "Happening now". Fully self-contained: no server
 * data, recomputes every tick so it never needs a refresh.
 */
type WeeklyEvent = {
  key: string;
  name: string;
  tag: string;
  href: string;
  logo: string;
  /** 0 = Sunday … 6 = Saturday (ET). */
  weekday: number;
  /** Start hour, 24h ET. */
  hour: number;
  /** How long it runs, hours (drives the "Happening now" window). */
  durationH: number;
};

const EVENTS: WeeklyEvent[] = [
  {
    key: "fnf",
    name: "Friday Nite Fights",
    tag: "Weekly 2v2 Swiss",
    href: "/friday-nite-fights",
    logo: "/brand/fnf.png",
    weekday: 5,
    hour: 21,
    durationH: 3,
  },
  {
    key: "sfs",
    name: "SH*T Faced Saturday",
    tag: "BYOB hangout",
    href: "/shitfaced-saturday",
    logo: "/brand/SFS.png",
    weekday: 6,
    hour: 21,
    durationH: 3,
  },
];

const HOUR_MS = 3_600_000;

/** Offset (ms) such that `utcMs + offset` reads as the ET wall clock. */
function etOffsetMs(utcMs: number): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const map: Record<string, number> = {};
  for (const p of dtf.formatToParts(new Date(utcMs))) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }
  let hour = map.hour;
  if (hour === 24) hour = 0;
  const asUTC = Date.UTC(map.year, map.month - 1, map.day, hour, map.minute, map.second);
  return asUTC - utcMs;
}

/** The UTC instant of a given ET wall-clock time (handles EST/EDT). */
function etWallToUtc(y: number, m1: number, d: number, h: number): number {
  const naive = Date.UTC(y, m1 - 1, d, h, 0, 0);
  let inst = naive - etOffsetMs(naive);
  inst = naive - etOffsetMs(inst); // refine across DST boundaries
  return inst;
}

function nextWindow(ev: WeeklyEvent, now: number): { start: number; end: number } {
  // Today's date in ET.
  const etNow = new Date(now + etOffsetMs(now));
  const y = etNow.getUTCFullYear();
  const m1 = etNow.getUTCMonth() + 1;
  const d = etNow.getUTCDate();
  const wd = etNow.getUTCDay();
  const delta = (ev.weekday - wd + 7) % 7;

  let start = etWallToUtc(y, m1, d + delta, ev.hour);
  let end = start + ev.durationH * HOUR_MS;
  if (end <= now) {
    start = etWallToUtc(y, m1, d + delta + 7, ev.hour);
    end = start + ev.durationH * HOUR_MS;
  }
  return { start, end };
}

function pickNext(now: number, only?: string) {
  const pool = only ? EVENTS.filter((e) => e.key === only) : EVENTS;
  const cands = (pool.length ? pool : EVENTS)
    .map((ev) => ({ ev, ...nextWindow(ev, now) }))
    .sort((a, b) => a.start - b.start);
  const c = cands[0];
  return { ...c, live: now >= c.start && now < c.end };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function EventCountdown({ only }: { only?: "fnf" | "sfs" } = {}) {
  // Tick every second, client-only (avoids a server/client time mismatch).
  // EFFECT JUSTIFICATION: a wall-clock interval is a genuine side-effect that
  // can't be derived from render; cleaned up on unmount.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // Seed on the next frame (not synchronously in the effect body) and then
    // tick every second.
    const raf = requestAnimationFrame(() => setNow(Date.now()));
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  const next = now == null ? null : pickNext(now, only);

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-6 md:px-10">
      <Link
        href={next?.ev.href ?? "/friday-nite-fights"}
        className="group relative flex w-full flex-col items-center gap-4 overflow-hidden rounded-2xl border border-thl-orange/30 bg-white/70 p-4 shadow-[0_18px_40px_-24px_rgba(247,97,3,0.5)] backdrop-blur-sm transition hover:border-thl-orange sm:flex-row sm:gap-6 sm:p-5 dark:bg-black/40"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(247,97,3,0.10)_1px,transparent_0)] [background-size:22px_22px]"
        />

        {/* Logo + name */}
        <div className="relative flex items-center gap-4">
          <span className="relative size-28 shrink-0 sm:size-[150px]">
            {next && (
              <Image
                src={next.ev.logo}
                alt={next.ev.name}
                fill
                sizes="150px"
                className="object-contain drop-shadow-[0_6px_20px_rgba(247,97,3,0.4)]"
              />
            )}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-thl-orange uppercase">
              {next?.live ? (
                <>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-thl-orange opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-thl-orange" />
                  </span>
                  Happening now
                </>
              ) : (
                "Up next"
              )}
            </div>
            <div className="truncate text-lg font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {next?.ev.name ?? "Next event"}
            </div>
            <div className="text-xs font-semibold text-neutral-500">
              {next?.ev.tag ?? " "}
            </div>
          </div>
        </div>

        {/* Countdown / live + CTA */}
        <div className="relative flex flex-wrap items-center gap-3 sm:ml-auto">
          {next && !next.live ? (
            <CountdownDigits target={next.start} now={now!} />
          ) : next?.live ? (
            <span className="rounded-xl bg-thl-orange/15 px-4 py-2 text-sm font-extrabold tracking-wide text-thl-orange uppercase">
              Live now
            </span>
          ) : (
            <CountdownDigits target={0} now={0} placeholder />
          )}

          <span className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-thl-orange px-5 text-sm font-bold text-black shadow-sm transition group-hover:-translate-y-0.5 group-hover:bg-thl-orange-deep">
            {next?.live ? "Join in" : "Details"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </section>
  );
}

function CountdownDigits({
  target,
  now,
  placeholder = false,
}: {
  target: number;
  now: number;
  placeholder?: boolean;
}) {
  const totalSec = placeholder ? 0 : Math.max(0, Math.floor((target - now) / 1000));
  const cells = [
    { v: Math.floor(totalSec / 86400), label: "Days" },
    { v: Math.floor((totalSec % 86400) / 3600), label: "Hrs" },
    { v: Math.floor((totalSec % 3600) / 60), label: "Min" },
    { v: totalSec % 60, label: "Sec" },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {cells.map((c) => (
        <div
          key={c.label}
          className="flex min-w-[3rem] flex-col items-center rounded-lg border border-neutral-200 bg-white px-2 py-1.5 dark:border-neutral-800 dark:bg-neutral-950"
        >
          <span className="text-xl leading-none font-extrabold tabular-nums text-neutral-900 dark:text-white">
            {placeholder ? "—" : pad(c.v)}
          </span>
          <span className="mt-1 text-[9px] font-bold tracking-[0.16em] text-neutral-400 uppercase">
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}
