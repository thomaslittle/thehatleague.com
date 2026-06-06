import type { FnfStanding } from "@/lib/fnf/pairing";
import { cn } from "@/lib/cn";

/** Swiss standings, best-first. Highlights the playoff qualifying line. */
export function StandingsTable({
  standings,
  teamNames,
  playoffCut,
}: {
  standings: FnfStanding[];
  teamNames: Map<string, { name: string; seed: number }>;
  playoffCut: number;
}) {
  if (standings.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-left text-[11px] tracking-wider text-neutral-500 uppercase dark:bg-neutral-900/60">
          <tr>
            <th className="px-3 py-2.5 font-bold">#</th>
            <th className="px-3 py-2.5 font-bold">Team</th>
            <th className="px-2 py-2.5 text-center font-bold">Pts</th>
            <th className="px-2 py-2.5 text-center font-bold">W</th>
            <th className="px-2 py-2.5 text-center font-bold">D</th>
            <th className="px-2 py-2.5 text-center font-bold">L</th>
            <th className="px-2 py-2.5 text-center font-bold">Diff</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => {
            const meta = teamNames.get(s.teamId);
            const qualifies = i < playoffCut;
            const cutLine = i === playoffCut - 1;
            return (
              <tr
                key={s.teamId}
                className={cn(
                  "border-t border-neutral-100 dark:border-neutral-800/60",
                  qualifies && "bg-thl-orange/[0.06]",
                  cutLine && "border-b-2 border-b-thl-orange/40",
                )}
              >
                <td className="px-3 py-2 font-bold tabular-nums text-neutral-500">
                  {i + 1}
                </td>
                <td className="px-3 py-2 font-semibold">
                  {meta?.name ?? "—"}
                </td>
                <td className="px-2 py-2 text-center text-base font-extrabold tabular-nums text-thl-orange">
                  {s.points}
                </td>
                <td className="px-2 py-2 text-center font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {s.wins}
                </td>
                <td className="px-2 py-2 text-center tabular-nums text-neutral-500">
                  {s.draws}
                </td>
                <td className="px-2 py-2 text-center tabular-nums text-neutral-500">
                  {s.losses}
                </td>
                <td className="px-2 py-2 text-center tabular-nums">
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
