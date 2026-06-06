import { MatchCard } from "@/components/fnf/match-card";
import type { FnfMatchCard } from "@/lib/data/fnf";

function roundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinals";
  if (fromEnd === 2) return "Quarterfinals";
  return `Round ${round}`;
}

/** Single-elimination playoff bracket, one column per round. */
export function BracketView({
  matches,
  viewerTeamIds,
  isAdmin,
}: {
  matches: FnfMatchCard[];
  viewerTeamIds: string[];
  isAdmin: boolean;
}) {
  const playoffs = matches.filter((m) => m.stage === "playoffs");
  if (playoffs.length === 0) return null;

  const rounds = [...new Set(playoffs.map((m) => m.round))].sort(
    (a, b) => a - b,
  );
  const totalRounds = rounds.length;
  const viewerSet = new Set(viewerTeamIds);

  return (
    <div className="flex gap-5 overflow-x-auto pb-2">
      {rounds.map((round) => {
        const list = playoffs
          .filter((m) => m.round === round)
          .sort((a, b) => a.slot - b.slot);
        return (
          <div key={round} className="min-w-[230px] flex-1 space-y-3">
            <h3 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
              {roundLabel(round, totalRounds)}
            </h3>
            <div className="flex h-full flex-col justify-around gap-3">
              {list.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
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
