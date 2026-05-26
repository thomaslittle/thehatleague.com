"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  HISTORICAL_PLAYERS,
  STAT_CATEGORIES,
  type Conference,
  type HistoricalPlayer,
  type StatCategory,
} from "@/lib/data/historical-player-stats";

type ConferenceFilter = "all" | Conference;

const CONFERENCE_OPTIONS: { key: ConferenceFilter; label: string; dot?: string }[] = [
  { key: "all", label: "All" },
  { key: "Sombrero", label: "Sombrero", dot: "bg-thl-sombrero" },
  { key: "Fedora", label: "Fedora", dot: "bg-thl-fedora" },
];

export function LeaderboardsExplorer() {
  const [tab, setTab] = useState<StatCategory>("goals");
  const [conf, setConf] = useState<ConferenceFilter>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const cat = STAT_CATEGORIES.find((c) => c.key === tab)!;

  const rows = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return HISTORICAL_PLAYERS.filter((p) => {
      if (conf !== "all" && p.conference !== conf) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => b[tab] - a[tab]);
  }, [conf, deferredQuery, tab]);

  const top = rows[0]?.[tab] ?? 1;

  return (
    <>
      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by player name…"
            className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-900 outline-none focus:border-thl-orange focus:ring-2 focus:ring-thl-orange/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
        </div>
        <div
          role="tablist"
          className="grid w-full grid-cols-3 gap-1 rounded-lg border border-neutral-200 bg-neutral-100 p-1 md:inline-flex md:w-auto dark:border-neutral-800 dark:bg-neutral-900"
        >
          {CONFERENCE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              role="tab"
              aria-selected={conf === opt.key}
              type="button"
              onClick={() => setConf(opt.key)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-bold whitespace-nowrap transition md:gap-2 md:px-3 ${
                conf === opt.key
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
      </div>

      <div className="mt-5 -mx-6 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:overflow-visible md:px-0">
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

      <p className="mt-3 text-sm text-neutral-500">
        {cat.description} ·{" "}
        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
          {rows.length}
        </span>{" "}
        of {HISTORICAL_PLAYERS.length} players
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="grid grid-cols-[36px_1fr_88px] gap-2 border-b border-neutral-200 px-4 py-3 text-[10px] font-bold tracking-[0.16em] text-neutral-500 uppercase md:grid-cols-[48px_1fr_56px_56px_56px_56px_120px] md:gap-4 md:px-6 dark:border-neutral-800">
          <span className="text-center">#</span>
          <span>Player</span>
          <span className="hidden text-center md:block">G</span>
          <span className="hidden text-center md:block">A</span>
          <span className="hidden text-center md:block">S</span>
          <span className="hidden text-center md:block">D</span>
          <span className="text-right">{cat.label}</span>
        </div>
        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-neutral-500">
            No players matched. Try clearing the filters.
          </div>
        ) : (
          <ol>
            {rows.map((row, i) => (
              <Row key={row.name} player={row} rank={i + 1} stat={tab} top={top} />
            ))}
          </ol>
        )}
      </div>
    </>
  );
}

function Row({
  player,
  rank,
  stat,
  top,
}: {
  player: HistoricalPlayer;
  rank: number;
  stat: StatCategory;
  top: number;
}) {
  const value = player[stat];
  const isLeader = rank === 1;
  return (
    <li
      className={`grid grid-cols-[36px_1fr_88px] items-center gap-2 px-4 py-3 text-sm transition md:grid-cols-[48px_1fr_56px_56px_56px_56px_120px] md:gap-4 md:px-6 ${
        isLeader
          ? "bg-thl-orange/10"
          : "border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-950"
      }`}
    >
      <span
        className={`text-center font-extrabold tabular-nums ${
          isLeader ? "text-thl-orange" : "text-neutral-400 dark:text-neutral-600"
        }`}
      >
        {String(rank).padStart(2, "0")}
      </span>
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            player.conference === "Fedora" ? "bg-thl-fedora" : "bg-thl-sombrero"
          }`}
          title={player.conference}
        />
        <span className="truncate font-semibold text-neutral-900 dark:text-white">
          {player.name}
        </span>
        {isLeader && (
          <span className="hidden rounded-full bg-thl-orange/15 px-2 py-0.5 text-[10px] font-bold tracking-[0.16em] text-thl-orange uppercase lg:inline-flex">
            ★ Leader
          </span>
        )}
      </div>
      <NumberCell value={player.goals} dim={stat !== "goals"} />
      <NumberCell value={player.assists} dim={stat !== "assists"} />
      <NumberCell value={player.saves} dim={stat !== "saves"} />
      <NumberCell value={player.demos} dim={stat !== "demos"} />
      <div className="flex items-center justify-end gap-3">
        <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100 md:block dark:bg-neutral-900">
          <div
            className="h-full bg-thl-orange/70"
            style={{ width: `${Math.max(4, (value / top) * 100)}%` }}
          />
        </div>
        <span
          className={`font-extrabold tabular-nums ${
            isLeader
              ? "text-xl text-thl-orange"
              : "text-base text-neutral-900 dark:text-white"
          }`}
        >
          {value}
        </span>
      </div>
    </li>
  );
}

function NumberCell({ value, dim }: { value: number; dim: boolean }) {
  return (
    <span
      className={`hidden text-center tabular-nums md:block ${
        dim
          ? "text-neutral-400 dark:text-neutral-600"
          : "text-neutral-900 dark:text-white"
      }`}
    >
      {value}
    </span>
  );
}
