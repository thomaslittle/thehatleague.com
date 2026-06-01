import Link from "next/link";
import { Clock } from "lucide-react";
import { ArrowRight } from "@/components/icons/brand";
import { CombineClips } from "@/components/combine/combine-clips";
import type { PlayerCombineView } from "@/lib/data/combine";

/**
 * A player's combine scouting profile, rendered the same way captains see it
 * on the combine board (role, availability, notes, showcase reel) — surfaced
 * on the player profile so scouting info lives in one shape everywhere.
 */
export function CombineProfileCard({
  combine,
  name,
}: {
  combine: PlayerCombineView;
  name: string;
}) {
  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between border-b border-neutral-200 px-7 py-5 dark:border-neutral-800">
        <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
          Pre-draft combine
        </div>
        <Link
          href="/combine"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          Combine board <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="px-7 py-6">
        {(combine.preferredRole || combine.availability) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {combine.preferredRole && (
              <span className="rounded-md bg-thl-orange/15 px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-thl-orange uppercase">
                {combine.preferredRole}
                {combine.secondaryRole ? ` / ${combine.secondaryRole}` : ""}
              </span>
            )}
            {combine.availability && (
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                <Clock className="h-3.5 w-3.5" aria-hidden /> {combine.availability}
              </span>
            )}
          </div>
        )}
        {combine.notes && (
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {combine.notes}
          </p>
        )}
        {combine.clipUrls.length > 0 && (
          <CombineClips clips={combine.clipUrls} name={name} className="mt-4 max-w-md" />
        )}
      </div>
    </section>
  );
}
