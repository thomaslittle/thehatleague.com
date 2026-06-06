import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { RankBadge } from "@/components/ranks/rank-badge";
import type { FnfTeamCard } from "@/lib/data/fnf";

/** Celebratory header shown on the FNF page once the champion is crowned. */
export function ChampionHero({
  team,
  runnerUp,
}: {
  team: FnfTeamCard;
  runnerUp: FnfTeamCard | null;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-thl-orange/40 bg-gradient-to-br from-thl-orange/[0.12] via-neutral-950 to-black p-7 shadow-xl shadow-black/30 md:p-9">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:22px_22px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-thl-orange/20 blur-3xl"
      />

      <div className="relative flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-thl-orange/40 bg-thl-orange/10 px-3 py-1 text-[11px] font-bold tracking-[0.22em] text-thl-orange uppercase">
          <Trophy className="size-3.5 text-amber-400" /> Champions
        </span>
        <h2 className="mt-3 text-3xl leading-[0.95] font-extrabold tracking-tight text-white md:text-5xl">
          {team.name}
        </h2>

        <div className="mt-7 flex flex-wrap items-start justify-center gap-7 md:gap-12">
          {team.members.map((p) => {
            const inner = (
              <>
                <div className="relative">
                  <span className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-300 to-thl-orange opacity-70 blur-[2px]" />
                  <div className="relative size-16 overflow-hidden rounded-full ring-2 ring-amber-300/90 md:size-20">
                    {p.avatarUrl ? (
                      <Image
                        src={p.avatarUrl}
                        alt={p.name}
                        fill
                        sizes="80px"
                        className="object-cover transition-transform duration-300 group-hover/champ:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-lg font-bold text-neutral-300">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-1.5 left-1/2 inline-flex -translate-x-1/2 items-center justify-center rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-black uppercase shadow">
                    Champ
                  </span>
                </div>
                <div className="mt-3.5 text-base font-bold text-white">
                  {p.name}
                </div>
                {p.rankValue && (
                  <div className="mt-1 flex justify-center">
                    <RankBadge
                      value={p.rankValue}
                      size={16}
                      abbreviate
                      textClassName="text-xs font-semibold text-amber-200"
                    />
                  </div>
                )}
              </>
            );
            return p.username ? (
              <Link
                key={p.id}
                href={`/players/${encodeURIComponent(p.username)}`}
                className="group/champ flex flex-col items-center"
              >
                {inner}
              </Link>
            ) : (
              <div key={p.id} className="flex flex-col items-center">
                {inner}
              </div>
            );
          })}
        </div>

        {runnerUp && (
          <p className="mt-7 text-sm text-neutral-400">
            <span className="font-semibold text-neutral-300">Runner-up:</span>{" "}
            {runnerUp.name} —{" "}
            {runnerUp.members.map((m) => m.name).join(" & ")}
          </p>
        )}
      </div>
    </section>
  );
}
