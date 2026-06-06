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
    <section className="relative overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-500/15 via-neutral-950 to-black p-8 shadow-2xl shadow-amber-500/10 md:p-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-amber-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-20 size-72 rounded-full bg-thl-orange/20 blur-3xl"
      />

      <div className="relative flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-bold tracking-widest text-amber-300 uppercase">
          <Trophy className="size-3.5" /> Champions
        </span>
        <h2 className="mt-4 text-4xl leading-[0.95] font-extrabold tracking-tight text-white md:text-6xl">
          {team.name}
        </h2>

        <div className="mt-8 flex flex-wrap items-start justify-center gap-8 md:gap-14">
          {team.members.map((p) => {
            const inner = (
              <>
                <div className="relative">
                  <span className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-300 to-thl-orange opacity-80 blur-[2px]" />
                  <div className="relative size-24 overflow-hidden rounded-full ring-2 ring-amber-300/90 md:size-28">
                    {p.avatarUrl ? (
                      <Image
                        src={p.avatarUrl}
                        alt={p.name}
                        fill
                        sizes="112px"
                        className="object-cover transition-transform duration-300 group-hover/champ:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-xl font-bold text-neutral-300">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-1 left-1/2 inline-flex -translate-x-1/2 items-center justify-center rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-black uppercase shadow">
                    Champ
                  </span>
                </div>
                <div className="mt-4 text-lg font-bold text-white">{p.name}</div>
                {p.rankValue && (
                  <div className="mt-1 flex justify-center">
                    <RankBadge
                      value={p.rankValue}
                      size={18}
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
          <p className="mt-8 text-sm text-neutral-400">
            <span className="font-semibold text-neutral-300">Runner-up:</span>{" "}
            {runnerUp.name} —{" "}
            {runnerUp.members.map((m) => m.name).join(" & ")}
          </p>
        )}
      </div>
    </section>
  );
}
