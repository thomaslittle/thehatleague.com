import { Trophy } from "lucide-react";
import { MatchCard } from "@/components/fnf/match-card";
import type { FnfMatchCard } from "@/lib/data/fnf";

function roundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinals";
  if (fromEnd === 2) return "Quarterfinals";
  return `Round ${round}`;
}

/** Single-elimination playoff bracket — one column per round, with connector
 *  rails, a funnel layout, and a champion spotlight once the final is decided. */
export function BracketView({
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
  const playoffs = matches.filter((m) => m.stage === "playoffs");
  if (playoffs.length === 0) return null;

  const rounds = [...new Set(playoffs.map((m) => m.round))].sort(
    (a, b) => a - b,
  );
  const totalRounds = rounds.length;
  const viewerSet = new Set(viewerTeamIds);

  const finalMatch = playoffs.find((m) => m.round === Math.max(...rounds));
  const championName =
    finalMatch?.winnerTeamId
      ? finalMatch.winnerTeamId === finalMatch.teamAId
        ? finalMatch.teamAName
        : finalMatch.teamBName
      : null;

  return (
    <div className="flex items-stretch gap-6 overflow-x-auto pb-4 md:gap-10">
      {rounds.map((round, ri) => {
        const list = playoffs
          .filter((m) => m.round === round)
          .sort((a, b) => a.slot - b.slot);
        const isFinalCol = round === Math.max(...rounds);
        return (
          <div key={round} className="flex min-w-[240px] flex-col">
            <div className="mb-3 flex items-center gap-1.5">
              {isFinalCol && <Trophy className="size-3.5 text-thl-orange" />}
              <span
                className={
                  isFinalCol
                    ? "text-xs font-bold tracking-[0.18em] text-thl-orange uppercase"
                    : "text-xs font-bold tracking-[0.18em] text-neutral-500 uppercase"
                }
              >
                {roundLabel(round, totalRounds)}
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-around gap-6">
              {list.map((m) => (
                <div key={m.id} className="relative">
                  {/* incoming rail (left) */}
                  {ri > 0 && (
                    <span
                      aria-hidden
                      className="absolute top-1/2 right-full hidden h-px w-6 bg-gradient-to-l from-neutral-300 to-transparent md:block dark:from-neutral-700"
                    />
                  )}
                  {/* outgoing rail (right) */}
                  {ri < rounds.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute top-1/2 left-full hidden h-px w-6 bg-gradient-to-r from-neutral-300 to-transparent md:block dark:from-neutral-700"
                    />
                  )}
                  <div
                    className={
                      isFinalCol
                        ? "rounded-xl bg-gradient-to-br from-amber-400/15 to-transparent p-[2px] shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40"
                        : undefined
                    }
                  >
                    <MatchCard
                      match={m}
                      locked={locked}
                      canReport={
                        isAdmin ||
                        (!!m.teamAId && viewerSet.has(m.teamAId)) ||
                        (!!m.teamBId && viewerSet.has(m.teamBId))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Champion spotlight */}
      <div className="flex min-w-[220px] flex-col justify-center">
        <div className="mb-3 text-xs font-bold tracking-[0.18em] text-thl-orange uppercase">
          Champion
        </div>
        <div
          className={
            championName
              ? "relative overflow-hidden rounded-2xl border border-thl-orange/40 bg-gradient-to-br from-thl-orange/15 to-amber-500/5 p-5 text-center shadow-lg shadow-thl-orange/10"
              : "rounded-2xl border border-dashed border-neutral-300 p-5 text-center dark:border-neutral-700"
          }
        >
          <Trophy
            className={
              championName
                ? "mx-auto size-8 text-thl-orange"
                : "mx-auto size-8 text-neutral-300 dark:text-neutral-700"
            }
          />
          {championName ? (
            <>
              <div className="mt-2 text-lg font-extrabold tracking-tight">
                {championName}
              </div>
              <div className="text-[11px] font-bold tracking-widest text-thl-orange uppercase">
                Friday Nite Fights champs
              </div>
            </>
          ) : (
            <div className="mt-2 text-sm text-neutral-400">
              Crowned after the final
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
