import { MatchCard } from "@/components/fnf/match-card";
import type { FnfMatchCard } from "@/lib/data/fnf";

/** Swiss matches grouped by round, newest round first. */
export function RoundsView({
  matches,
  viewerTeamIds,
  isAdmin,
  locked = false,
}: {
  matches: FnfMatchCard[];
  viewerTeamIds: string[];
  isAdmin: boolean;
  /** Tournament finished — freeze result editing. */
  locked?: boolean;
}) {
  const swiss = matches.filter((m) => m.stage === "swiss");
  if (swiss.length === 0) return null;

  const byRound = new Map<number, FnfMatchCard[]>();
  for (const m of swiss) {
    const list = byRound.get(m.round) ?? [];
    list.push(m);
    byRound.set(m.round, list);
  }
  const rounds = [...byRound.keys()].sort((a, b) => b - a);
  const viewerSet = new Set(viewerTeamIds);

  return (
    <div className="space-y-6">
      {rounds.map((round) => {
        const list = (byRound.get(round) ?? []).sort((a, b) => a.slot - b.slot);
        const done = list.every((m) => m.status === "reported");
        return (
          <div key={round}>
            <div className="mb-2.5 flex items-center gap-2">
              <h3 className="text-sm font-bold">Round {round}</h3>
              <span
                className={
                  done
                    ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-600 uppercase dark:text-emerald-400"
                    : "rounded-full bg-thl-orange/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-thl-orange uppercase"
                }
              >
                {done ? "Complete" : "In progress"}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {list.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  locked={locked}
                  canReport={
                    isAdmin ||
                    (!!m.teamAId && viewerSet.has(m.teamAId)) ||
                    (!!m.teamBId && viewerSet.has(m.teamBId))
                  }
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
