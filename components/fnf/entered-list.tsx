import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { RankBadge } from "@/components/ranks/rank-badge";
import { RemovePlayerControl } from "@/components/fnf/remove-player-control";
import type { FnfPlayerCard } from "@/lib/data/fnf";
import { cn } from "@/lib/cn";

/** Polished grid of entered players (rank-sorted). Each card links to the
 *  player's profile when we know their handle. Admins get a remove button. */
export function EnteredList({
  registrations,
  isAdmin = false,
  tournamentId,
}: {
  registrations: FnfPlayerCard[];
  isAdmin?: boolean;
  tournamentId?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {registrations.map((p, i) => {
        const card = (
          <div
            className={cn(
              "group flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 transition dark:border-neutral-800 dark:bg-neutral-900",
              p.username &&
                "hover:-translate-y-0.5 hover:border-thl-orange/50 hover:shadow-md hover:shadow-thl-orange/5",
            )}
          >
            <span className="w-5 shrink-0 text-center text-xs font-bold tabular-nums text-neutral-400">
              {i + 1}
            </span>
            {p.avatarUrl ? (
              <Image
                src={p.avatarUrl}
                alt=""
                width={40}
                height={40}
                className="size-10 shrink-0 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
                aria-hidden
              />
            ) : (
              <span className="size-10 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold leading-tight">
                {p.name}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <RankBadge
                  value={p.rankValue}
                  size={16}
                  abbreviate
                  textClassName="text-[11px] text-neutral-500"
                />
              </div>
            </div>
            {p.username ? (
              <ChevronRight className="size-4 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-thl-orange dark:text-neutral-600" />
            ) : null}
          </div>
        );

        return (
          <div key={p.id} className="relative">
            {p.username ? (
              <Link
                href={`/players/${encodeURIComponent(p.username)}`}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thl-orange/40"
              >
                {card}
              </Link>
            ) : (
              <div>{card}</div>
            )}
            {isAdmin && tournamentId && (
              <RemovePlayerControl
                tournamentId={tournamentId}
                profileId={p.id}
                name={p.name}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
