import Image from "next/image";
import type { FnfStanding } from "@/lib/fnf/pairing";
import type { FnfTeamCard } from "@/lib/data/fnf";
import { cn } from "@/lib/cn";

/** Swiss standings, best-first — shows each team's players and highlights the
 *  playoff qualifying line. */
export function StandingsTable({
  standings,
  teams,
  playoffCut,
}: {
  standings: FnfStanding[];
  teams: FnfTeamCard[];
  playoffCut: number;
}) {
  if (standings.length === 0) return null;
  const byId = new Map(teams.map((t) => [t.id, t]));

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-[10px] tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-900/60">
          <tr>
            <th className="py-2.5 pl-3 pr-1 font-bold">#</th>
            <th className="px-2 py-2.5 font-bold">Team</th>
            <th className="px-2 py-2.5 text-center font-bold">Pts</th>
            <th
              className="px-2 py-2.5 text-center font-bold"
              title="Wins–Draws–Losses"
            >
              W-D-L
            </th>
            <th
              className="py-2.5 pl-1 pr-3 text-center font-bold"
              title="Goal differential — total goals scored minus conceded across all games"
            >
              Diff
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => {
            const team = byId.get(s.teamId);
            const qualifies = i < playoffCut;
            const cutLine = i === playoffCut - 1;
            return (
              <tr
                key={s.teamId}
                className={cn(
                  "border-t border-neutral-100 align-middle dark:border-neutral-800/60",
                  qualifies && "bg-thl-orange/[0.05]",
                  cutLine && "border-b-2 border-b-thl-orange/40",
                )}
              >
                <td className="py-2.5 pl-3 pr-1">
                  <span
                    className={cn(
                      "inline-flex size-5 items-center justify-center rounded-md text-[11px] font-extrabold tabular-nums",
                      qualifies
                        ? "bg-thl-orange/15 text-thl-orange"
                        : "text-neutral-400",
                    )}
                  >
                    {i + 1}
                  </span>
                </td>
                <td className="px-2 py-2.5">
                  <div className="font-bold leading-tight">
                    {team?.name ?? "—"}
                  </div>
                  {team && team.members.length > 0 && (
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      {team.members.map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400"
                        >
                          {m.avatarUrl ? (
                            <Image
                              src={m.avatarUrl}
                              alt=""
                              width={14}
                              height={14}
                              className="size-3.5 shrink-0 rounded-full object-cover"
                              aria-hidden
                            />
                          ) : null}
                          <span className="truncate">{m.name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-2 py-2.5 text-center text-base font-extrabold tabular-nums text-thl-orange">
                  {s.points}
                </td>
                <td className="px-2 py-2.5 text-center text-[13px] font-semibold tabular-nums text-neutral-600 dark:text-neutral-300">
                  {s.wins}-{s.draws}-{s.losses}
                </td>
                <td
                  className={cn(
                    "py-2.5 pl-1 pr-3 text-center text-[13px] font-semibold tabular-nums",
                    s.gameDiff > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : s.gameDiff < 0
                        ? "text-red-500/80"
                        : "text-neutral-400",
                  )}
                >
                  {s.gameDiff > 0 ? `+${s.gameDiff}` : s.gameDiff}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
