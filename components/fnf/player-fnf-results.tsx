import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";
import type { FnfPlayerResult } from "@/lib/data/fnf";
import { cn } from "@/lib/cn";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

/** Friday Nite Fights history shown on a player profile — team, record, and
 *  placement for each tournament they entered. */
export function PlayerFnfResults({
  results,
}: {
  results: FnfPlayerResult[];
}) {
  if (results.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        Tournaments
      </div>
      <h2 className="mt-2 mb-5 flex items-center gap-2.5 text-2xl leading-tight font-bold tracking-tight md:text-3xl">
        <Image
          src="/brand/fnf.png"
          alt=""
          width={32}
          height={32}
          className="size-7 object-contain"
          aria-hidden
        />
        Friday Nite Fights
      </h2>
      <div className="space-y-3">
        {results.map((r) => (
          <div
            key={r.tournamentId}
            className={cn(
              "rounded-xl border p-4",
              r.isChampion
                ? "border-amber-400/40 bg-gradient-to-br from-amber-400/[0.08] to-transparent"
                : "border-neutral-200 dark:border-neutral-800",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href="/friday-nite-fights"
                  className="font-bold hover:text-thl-orange"
                >
                  {r.tournamentName}
                </Link>
                {r.startsAt && (
                  <div className="text-xs text-neutral-500">
                    {new Date(r.startsAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>
              {r.isChampion ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-black uppercase">
                  <Trophy className="size-3.5" /> Champion
                </span>
              ) : r.placement ? (
                <span className="inline-flex shrink-0 items-center rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {ordinal(r.placement)} of {r.totalTeams}
                  {r.madePlayoffs ? " · Playoffs" : ""}
                </span>
              ) : null}
            </div>

            {r.teamName && (
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                  {r.teamName}
                </span>
                {r.teammates.length > 0 && (
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-neutral-500">
                    <span className="text-xs">with</span>
                    {r.teammates.map((m) => {
                      const inner = (
                        <span className="inline-flex items-center gap-1">
                          {m.avatarUrl ? (
                            <Image
                              src={m.avatarUrl}
                              alt=""
                              width={16}
                              height={16}
                              className="size-4 rounded-full object-cover"
                              aria-hidden
                            />
                          ) : null}
                          <span className="text-xs font-semibold">
                            {m.name}
                          </span>
                        </span>
                      );
                      return m.username ? (
                        <Link
                          key={m.id}
                          href={`/players/${encodeURIComponent(m.username)}`}
                          className="hover:text-thl-orange"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <span key={m.id}>{inner}</span>
                      );
                    })}
                  </span>
                )}
              </div>
            )}

            {r.points != null && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Stat label="Pts" value={r.points} accent />
                <Stat label="W-D-L" value={`${r.wins}-${r.draws}-${r.losses}`} />
                <Stat
                  label="Diff"
                  value={r.gameDiff > 0 ? `+${r.gameDiff}` : r.gameDiff}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs dark:border-neutral-800">
      <span className="font-bold tracking-wide text-neutral-400 uppercase">
        {label}
      </span>
      <span
        className={cn(
          "font-bold tabular-nums",
          accent && "text-thl-orange",
        )}
      >
        {value}
      </span>
    </span>
  );
}
