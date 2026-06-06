"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SeasonLeaderRow } from "@/lib/data/stats";

type Cat = "score" | "goals" | "assists" | "saves" | "demos";
const CATS: { key: Cat; label: string }[] = [
  { key: "score", label: "Score" },
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "saves", label: "Saves" },
  { key: "demos", label: "Demos" },
];

/** Live Season-4 stat leaders: category tabs, total/per-game, conference filter. */
export function LiveLeaders({
  rows,
  conferences,
}: {
  rows: SeasonLeaderRow[];
  conferences: string[];
}) {
  const [cat, setCat] = useState<Cat>("score");
  const [perGame, setPerGame] = useState(false);
  const [conf, setConf] = useState<string>("all");

  const value = (r: SeasonLeaderRow): number => {
    const raw = r[cat];
    return perGame && r.gp > 0 ? raw / r.gp : raw;
  };

  const ranked = useMemo(() => {
    return rows
      .filter((r) => conf === "all" || r.conference === conf)
      .filter((r) => r.gp > 0)
      .sort((a, b) => value(b) - value(a))
      .slice(0, 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, cat, perGame, conf]);

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950 md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex flex-wrap rounded-lg border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
          {CATS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCat(c.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                cat === c.key ? "bg-thl-orange text-black" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <Button
          variant={perGame ? "default" : "outline"}
          size="sm"
          onClick={() => setPerGame((v) => !v)}
        >
          {perGame ? "Per game" : "Total"}
        </Button>
        {conferences.length > 1 && (
          <Select value={conf} onValueChange={setConf}>
            <SelectTrigger className="h-7 w-[180px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All conferences</SelectItem>
              {conferences.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <ol className="mt-4 space-y-1">
        {ranked.map((r, i) => (
          <li
            key={r.profileId}
            className="flex items-center gap-3 rounded-lg border border-neutral-100 px-3 py-2 dark:border-neutral-900"
          >
            <span className="w-6 text-center text-lg font-bold text-thl-orange tabular-nums">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-bold">
              {r.username ? (
                <Link href={`/players/${encodeURIComponent(r.username)}`} className="hover:text-thl-orange">
                  {r.name}
                </Link>
              ) : (
                r.name
              )}
              {r.teamName && <span className="ml-2 text-xs font-normal text-neutral-400">{r.teamName}</span>}
            </span>
            <span className="text-lg font-bold tabular-nums">
              {perGame ? value(r).toFixed(1) : value(r)}
            </span>
          </li>
        ))}
        {ranked.length === 0 && <li className="px-1 py-6 text-center text-sm text-neutral-500">No stats yet.</li>}
      </ol>
    </div>
  );
}
