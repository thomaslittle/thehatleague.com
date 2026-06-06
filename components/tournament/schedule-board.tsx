"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { MatchView } from "@/lib/data/tournament";

/**
 * Live season calendar. Groups matches by week, with conference + "my team"
 * filters. Each match links to its match center. Server-rendered data is kept
 * fresh by a `RealtimeRefresh` mounted on the page.
 */
export function ScheduleBoard({
  matches,
  conferences,
  myTeamId,
}: {
  matches: MatchView[];
  conferences: string[];
  myTeamId: string | null;
}) {
  const [conf, setConf] = useState<string>("all");
  const [mineOnly, setMineOnly] = useState(false);

  const filtered = useMemo(
    () =>
      matches.filter((m) => {
        if (conf !== "all" && (m.conference ?? "") !== conf) return false;
        if (mineOnly && myTeamId && m.home?.id !== myTeamId && m.away?.id !== myTeamId) return false;
        return true;
      }),
    [matches, conf, mineOnly, myTeamId],
  );

  const byWeek = useMemo(() => {
    const m = new Map<number, MatchView[]>();
    for (const match of filtered) {
      const wk = match.week ?? 0;
      if (!m.has(wk)) m.set(wk, []);
      m.get(wk)!.push(match);
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  return (
    <section className="mx-auto max-w-[1320px] px-6 pb-24 md:px-10">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
          <Chip active={conf === "all"} onClick={() => setConf("all")}>
            All
          </Chip>
          {conferences.map((c) => (
            <Chip key={c} active={conf === c} onClick={() => setConf(c)}>
              {c}
            </Chip>
          ))}
        </div>
        {myTeamId && (
          <Button
            variant={mineOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setMineOnly((v) => !v)}
          >
            My team
          </Button>
        )}
      </div>

      {byWeek.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
          No matches{mineOnly ? " for your team" : ""} yet.
        </div>
      ) : (
        <div className="space-y-10">
          {byWeek.map(([week, list]) => (
            <div key={week}>
              <h3 className="text-xl font-bold tracking-tight">{week === 0 ? "Unscheduled" : `Week ${week}`}</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {list.map((m) => (
                  <MatchCard key={m.id} match={m} myTeamId={myTeamId} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function MatchCard({ match, myTeamId }: { match: MatchView; myTeamId: string | null }) {
  const isFinal = match.status === "final";
  const homeWon = match.winnerTeamId === match.home?.id;
  const mine = myTeamId && (match.home?.id === myTeamId || match.away?.id === myTeamId);

  return (
    <Link
      href={`/matches/${match.id}`}
      className={`group block rounded-2xl border bg-white p-4 transition hover:border-thl-orange dark:bg-neutral-950 ${
        mine ? "border-thl-orange/50" : "border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase">
        <span>{match.conference ?? "League"}</span>
        <span className={isFinal ? "text-emerald-500" : "text-thl-orange"}>
          {isFinal ? "Final" : match.scheduledAt ? formatWhen(match.scheduledAt) : "TBD"}
        </span>
      </div>
      <TeamRow team={match.home?.name ?? "TBD"} score={isFinal ? match.homeScore : null} won={isFinal && homeWon} />
      <TeamRow team={match.away?.name ?? "TBD"} score={isFinal ? match.awayScore : null} won={isFinal && !homeWon} />
    </Link>
  );
}

function TeamRow({ team, score, won }: { team: string; score: number | null; won: boolean }) {
  return (
    <div className="mt-2 flex items-center justify-between">
      <span className={`truncate text-sm ${won ? "font-extrabold" : "font-semibold text-neutral-600 dark:text-neutral-300"}`}>
        {team}
      </span>
      {score !== null && (
        <span className={`ml-2 text-lg font-bold tabular-nums ${won ? "text-thl-orange" : "text-neutral-400"}`}>{score}</span>
      )}
    </div>
  );
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
        active ? "bg-thl-orange text-black" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
