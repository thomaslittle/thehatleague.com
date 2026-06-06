import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { RankBadge } from "@/components/ranks/rank-badge";
import type { FnfTeamCard } from "@/lib/data/fnf";

/** Slim champion band shown atop a finished tournament's bracket. Deliberately
 *  compact — the bracket below is the main event. */
export function ChampionHero({
  team,
  runnerUp,
}: {
  team: FnfTeamCard;
  runnerUp: FnfTeamCard | null;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-thl-orange/40 bg-gradient-to-br from-thl-orange/[0.12] via-neutral-950 to-black p-5 shadow-lg shadow-black/20 md:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:22px_22px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-12 size-56 rounded-full bg-thl-orange/15 blur-3xl"
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.24em] text-thl-orange uppercase">
            <Trophy className="size-3.5 text-amber-400" /> Champions
          </span>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-white md:text-2xl">
            {team.name}
          </h2>
          {runnerUp && (
            <p className="mt-1 text-xs text-neutral-400">
              <span className="text-neutral-500">Runner-up:</span>{" "}
              {runnerUp.name} — {runnerUp.members.map((m) => m.name).join(" & ")}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:ml-auto">
          {team.members.map((p) => {
            const inner = (
              <>
                <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-amber-400/80">
                  {p.avatarUrl ? (
                    <Image
                      src={p.avatarUrl}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-neutral-800 text-[11px] font-bold text-neutral-300">
                      {p.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-bold text-white group-hover/champ:text-thl-orange">
                    {p.name}
                  </span>
                  {p.rankValue && (
                    <RankBadge
                      value={p.rankValue}
                      size={13}
                      abbreviate
                      textClassName="text-[11px] font-semibold text-neutral-400"
                    />
                  )}
                </span>
              </>
            );
            return p.username ? (
              <Link
                key={p.id}
                href={`/players/${encodeURIComponent(p.username)}`}
                className="group/champ inline-flex items-center gap-2 transition hover:opacity-90"
              >
                {inner}
              </Link>
            ) : (
              <span key={p.id} className="inline-flex items-center gap-2">
                {inner}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
