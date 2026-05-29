"use client";

import { useMemo, useState } from "react";
import {
  HISTORICAL_PLAYERS,
  STAT_CATEGORIES,
  type Conference,
  type StatCategory,
} from "@/lib/data/historical-player-stats";

type ConferenceFilter = "all" | Conference;

function leaderboard(
  category: StatCategory,
  filter: ConferenceFilter,
  limit = 10,
) {
  const base =
    filter === "all"
      ? HISTORICAL_PLAYERS
      : HISTORICAL_PLAYERS.filter((p) => p.conference === filter);
  return [...base].sort((a, b) => b[category] - a[category]).slice(0, limit);
}

export function PlayerStats() {
  const [tab, setTab] = useState<StatCategory>("goals");
  const [conference, setConference] = useState<ConferenceFilter>("all");

  const rows = useMemo(() => leaderboard(tab, conference), [tab, conference]);
  const top = rows[0]?.[tab] ?? 1;
  const cat = STAT_CATEGORIES.find((c) => c.key === tab)!;

  return (
    <section
      id="stats"
      className="thl-grain thl-wash-green border-y border-neutral-200 bg-neutral-100/60 dark:border-neutral-900 dark:bg-neutral-950"
    >
      <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-28">
        <div className="mb-10 grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-3 text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
              Season 03 · Player stats
            </div>
            <h2 className="text-4xl leading-[0.98] font-bold tracking-[-0.03em] text-neutral-900 md:text-5xl lg:text-6xl dark:text-white">
              Who showed up.{" "}
              <span className="font-marker font-normal text-thl-orange">
                Receipts.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-neutral-600 dark:text-neutral-400">
              {cat.description}
            </p>
          </div>
          <ConferenceSwitch value={conference} onChange={setConference} />
        </div>

        <div className="mb-6 -mx-6 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:overflow-visible md:px-0">
          <div
            role="tablist"
            className="inline-flex w-max gap-1 rounded-xl border border-neutral-200 bg-white p-1 md:w-fit md:max-w-full dark:border-neutral-800 dark:bg-neutral-900"
          >
            {STAT_CATEGORIES.map((c) => (
              <button
                key={c.key}
                role="tab"
                aria-selected={tab === c.key}
                type="button"
                onClick={() => setTab(c.key)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold whitespace-nowrap transition md:px-4 md:text-sm ${
                  tab === c.key
                    ? "bg-thl-orange text-black shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
          <div className="grid grid-cols-[36px_1fr_64px] gap-2 border-b border-neutral-200 px-4 py-3 text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase md:grid-cols-[80px_1fr_180px_140px] md:gap-4 md:px-6 md:py-3.5 dark:border-neutral-800">
            <span>#</span>
            <span>Player</span>
            <span className="hidden md:block">Conference</span>
            <span className="text-right">{cat.label}</span>
          </div>
          <ol>
            {rows.map((row, i) => {
              const value = row[tab];
              return (
                <li
                  key={row.name}
                  className={`grid grid-cols-[36px_1fr_64px] items-center gap-2 px-4 py-3 transition md:grid-cols-[80px_1fr_180px_140px] md:gap-4 md:px-6 md:py-4 ${
                    i === 0
                      ? "bg-thl-orange/10"
                      : "border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-950"
                  }`}
                >
                  <span
                    className={`font-extrabold tabular-nums ${
                      i === 0
                        ? "text-lg text-thl-orange"
                        : "text-sm text-neutral-400 dark:text-neutral-600"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-[11px] font-bold text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                      {row.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-neutral-900 dark:text-white">
                        {row.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 md:hidden">
                        {row.conference}
                      </div>
                    </div>
                    {i === 0 && (
                      <span className="ml-2 hidden items-center gap-1.5 rounded-full bg-thl-orange/15 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.16em] text-thl-orange uppercase md:inline-flex">
                        ★ Leader
                      </span>
                    )}
                  </div>
                  <span className="hidden items-center gap-2 text-sm text-neutral-600 md:flex dark:text-neutral-400">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        row.conference === "Fedora"
                          ? "bg-thl-fedora"
                          : "bg-thl-sombrero"
                      }`}
                    />
                    {row.conference}
                  </span>
                  <div className="flex items-center justify-end gap-3">
                    <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100 md:block dark:bg-neutral-900">
                      <div
                        className="h-full bg-thl-orange/70"
                        style={{ width: `${(value / top) * 100}%` }}
                      />
                    </div>
                    <span
                      className={`font-extrabold tabular-nums ${
                        i === 0
                          ? "text-xl text-thl-orange"
                          : "text-base text-neutral-900 dark:text-white"
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="mt-5 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500">
          <span>
            Season 4 stats will pull from{" "}
            <span className="font-semibold text-thl-orange">
              ballchasing.com
            </span>{" "}
            once the new league structure is set. Numbers shown are Season 3
            regular-season totals.
          </span>
          <a
            href="/leaderboards"
            className="font-semibold text-thl-orange underline-offset-4 hover:underline"
          >
            Open the full leaderboard →
          </a>
        </p>
      </div>
    </section>
  );
}

function ConferenceSwitch({
  value,
  onChange,
}: {
  value: ConferenceFilter;
  onChange: (v: ConferenceFilter) => void;
}) {
  const options: { key: ConferenceFilter; label: string; dot?: string }[] = [
    { key: "all", label: "All" },
    { key: "Sombrero", label: "Sombrero", dot: "bg-thl-sombrero" },
    { key: "Fedora", label: "Fedora", dot: "bg-thl-fedora" },
  ];
  return (
    <div
      role="tablist"
      className="grid w-full grid-cols-3 gap-1 rounded-lg border border-neutral-200 bg-neutral-100 p-1 md:inline-flex md:w-auto dark:border-neutral-800 dark:bg-neutral-900"
    >
      {options.map((opt) => (
        <button
          key={opt.key}
          role="tab"
          aria-selected={value === opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-bold whitespace-nowrap transition md:gap-2 md:px-3 ${
            value === opt.key
              ? "bg-thl-orange text-black"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          {opt.dot && (
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${opt.dot}`} />
          )}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
