import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";
import type { FnfChampionEntry, FnfAllTimeStat } from "@/lib/data/fnf";
import { cn } from "@/lib/cn";

function PlayerLink({
  name,
  username,
  avatarUrl,
  size = 18,
}: {
  name: string;
  username: string | null;
  avatarUrl: string | null;
  size?: number;
}) {
  const inner = (
    <span className="inline-flex items-center gap-1.5">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          width={size}
          height={size}
          style={{ width: size, height: size }}
          className="shrink-0 rounded-full object-cover"
          aria-hidden
        />
      ) : null}
      <span className="truncate text-sm font-semibold">{name}</span>
    </span>
  );
  return username ? (
    <Link
      href={`/players/${encodeURIComponent(username)}`}
      className="hover:text-thl-orange"
    >
      {inner}
    </Link>
  ) : (
    inner
  );
}

/** Past FNF champions — a hall of fame. */
export function HallOfChampions({
  history,
}: {
  history: FnfChampionEntry[];
}) {
  if (history.length === 0) return null;
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight">
        <Trophy className="size-4 text-amber-400" /> Hall of champions
      </h2>
      <div className="space-y-2.5">
        {history.map((h) => (
          <div
            key={h.tournamentId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/25 bg-gradient-to-r from-amber-400/[0.06] to-transparent p-3.5"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-400/15 text-amber-400">
                <Trophy className="size-4" />
              </span>
              <div>
                <div className="text-sm font-bold">
                  {h.champions?.name ?? "—"}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-neutral-500">
                  {h.champions?.members.map((m) => (
                    <PlayerLink key={m.id} {...m} size={16} />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-neutral-500">
              <div className="font-semibold text-neutral-400">
                {h.tournamentName}
              </div>
              {h.date && (
                <div>
                  {new Date(h.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** All-time per-player FNF leaderboard. */
export function AllTimeStats({ stats }: { stats: FnfAllTimeStat[] }) {
  if (stats.length === 0) return null;
  // Show the whole field (capped generously) — a short tournament has only a
  // dozen-plus fighters, and cutting at 15 was dropping real entrants.
  const top = stats.slice(0, 50);
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold tracking-tight">All-time leaders</h2>
      <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-[10px] tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-900/60">
            <tr>
              <th className="py-2.5 pl-3 pr-1 font-bold">#</th>
              <th className="px-2 py-2.5 font-bold">Player</th>
              <th
                className="px-2 py-2.5 text-center font-bold"
                title="Championships"
              >
                🏆
              </th>
              <th className="px-2 py-2.5 text-center font-bold">W-D-L</th>
              <th className="py-2.5 pl-1 pr-3 text-center font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {top.map((s, i) => (
              <tr
                key={s.id}
                className="border-t border-neutral-100 dark:border-neutral-800/60"
              >
                <td className="py-2.5 pl-3 pr-1 text-xs font-bold tabular-nums text-neutral-400">
                  {i + 1}
                </td>
                <td className="px-2 py-2.5">
                  <PlayerLink
                    name={s.name}
                    username={s.username}
                    avatarUrl={s.avatarUrl}
                    size={22}
                  />
                </td>
                <td
                  className={cn(
                    "px-2 py-2.5 text-center font-extrabold tabular-nums",
                    s.titles > 0 ? "text-amber-400" : "text-neutral-400",
                  )}
                >
                  {s.titles}
                </td>
                <td className="px-2 py-2.5 text-center text-[13px] font-semibold tabular-nums text-neutral-600 dark:text-neutral-300">
                  {s.wins}-{s.draws}-{s.losses}
                </td>
                <td className="py-2.5 pl-1 pr-3 text-center font-bold tabular-nums text-thl-orange">
                  {s.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
