import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Trophy, Swords } from "lucide-react";
import { getActiveFnf, getPlayerFnfResults } from "@/lib/data/fnf";

/**
 * Dashboard surface for Friday Nite Fights — a player's fight record plus a
 * live hook into the current tournament. Renders nothing when the player has
 * never entered and there's no active tournament to join.
 */
export async function DashboardFnfCard({ userId }: { userId: string }) {
  const [results, active] = await Promise.all([
    getPlayerFnfResults(userId),
    getActiveFnf(),
  ]);

  const open =
    active?.status === "registration" ||
    active?.status === "teams" ||
    active?.status === "swiss" ||
    active?.status === "playoffs";
  if (results.length === 0 && !open) return null;

  const titles = results.filter((r) => r.isChampion).length;
  const playoffRuns = results.filter((r) => r.madePlayoffs).length;
  const best = results.reduce<number | null>((acc, r) => {
    if (r.placement == null) return acc;
    return acc == null ? r.placement : Math.min(acc, r.placement);
  }, null);

  const liveLabel =
    active?.status === "registration"
      ? "Registration open"
      : active?.status === "teams"
        ? "Teams locked"
        : active?.status === "swiss" || active?.status === "playoffs"
          ? "Live now"
          : null;

  return (
    <section className="relative mt-10 overflow-hidden rounded-3xl border border-thl-orange/30 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:22px_22px]"
      />
      <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-center gap-4">
          <div className="relative size-14 shrink-0">
            <Image
              src="/brand/fnf.png"
              alt=""
              fill
              sizes="56px"
              className="object-contain drop-shadow-[0_4px_20px_rgba(247,97,3,0.4)]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Friday Nite Fights
              {liveLabel && (
                <span className="inline-flex items-center gap-1 rounded-full border border-thl-orange/40 bg-thl-orange/10 px-2 py-0.5 text-[9px] text-thl-orange">
                  <span className="size-1 animate-pulse rounded-full bg-thl-orange" />
                  {liveLabel}
                </span>
              )}
            </div>
            <div className="mt-1 text-xl font-bold text-white">
              {results.length > 0 ? "Your fight record" : "Step into the ring"}
            </div>
            {results.length > 0 && (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-400">
                {titles > 0 && (
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                    <Trophy className="size-3.5" />
                    {titles} {titles === 1 ? "title" : "titles"}
                  </span>
                )}
                {titles > 0 && <span aria-hidden>·</span>}
                <span>
                  {results.length} {results.length === 1 ? "entry" : "entries"}
                </span>
                {best != null && (
                  <>
                    <span aria-hidden>·</span>
                    <span>best #{best}</span>
                  </>
                )}
                {playoffRuns > 0 && (
                  <>
                    <span aria-hidden>·</span>
                    <span>
                      {playoffRuns} playoff {playoffRuns === 1 ? "run" : "runs"}
                    </span>
                  </>
                )}
              </div>
            )}
            {results.length === 0 && (
              <p className="mt-1.5 max-w-md text-sm text-neutral-400">
                Auto-balanced 2v2 Swiss every Friday. Enter solo — we build the
                teams.
              </p>
            )}
          </div>
        </div>

        <Link
          href="/friday-nite-fights"
          className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-thl-orange to-amber-500 px-6 text-sm font-bold text-white shadow-lg shadow-thl-orange/30 transition hover:-translate-y-0.5"
        >
          {open ? <Swords className="size-4" /> : <Trophy className="size-4" />}
          {open ? "Go to fight night" : "See the hub"}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
