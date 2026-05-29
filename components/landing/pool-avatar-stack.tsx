import Image from "next/image";
import Link from "next/link";
import type { PoolAvatar } from "@/lib/auth/viewer";
import { RankBadge } from "@/components/ranks/rank-badge";

/**
 * Social-proof avatar group for the hero. Far-left is the THL logo carrying a
 * badge with the total pool count; pool members' avatars stack and overlap to
 * its right, each with a hover tooltip (name + peak rank). Links to the pool.
 *
 * Capped to a mobile-safe number of faces (the badge always shows the true
 * total) so the row never forces horizontal page scroll — and so tooltips
 * aren't clipped by an overflow container.
 */
export function PoolAvatarStack({
  avatars,
  count,
  max = 18,
  className,
}: {
  avatars: PoolAvatar[];
  count: number;
  max?: number;
  className?: string;
}) {
  if (count <= 0) return null;
  const shown = avatars.slice(0, max);

  return (
    <Link
      href="/pool"
      aria-label={`${count} players in the pool — view the player pool`}
      className={`group/stack inline-flex max-w-full items-center -space-x-2.5 py-1 ${className ?? ""}`}
    >
      {/* Logo + count badge (far left, on top). */}
      <div className="relative z-30 shrink-0">
        <span className="block h-11 w-11 overflow-hidden rounded-full bg-thl-orange ring-2 ring-white dark:ring-neutral-950">
          <Image
            src="/brand/thl-logo-notext.png"
            alt="The Hat League"
            width={44}
            height={44}
            className="h-full w-full object-cover"
          />
        </span>
        <span className="absolute -right-1.5 -bottom-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-[11px] font-extrabold tabular-nums text-white ring-2 ring-white dark:bg-white dark:text-black dark:ring-neutral-950">
          {count > 999 ? "999+" : count}
        </span>
      </div>

      {/* Pool member avatars, overlapping rightward. */}
      {shown.map((a, i) => {
        const initials = a.name.slice(0, 2).toUpperCase();
        // Reveal more faces as the viewport widens so the row never overflows
        // (or clips a half-avatar) on narrow screens. The badge shows the true
        // total regardless of how many faces are visible.
        const display =
          i < 6
            ? "inline-flex"
            : i < 10
              ? "hidden sm:inline-flex"
              : i < 14
                ? "hidden md:inline-flex"
                : "hidden lg:inline-flex";
        return (
          <span
            key={a.id}
            style={{ zIndex: 20 - i }}
            className={`group/av relative ${display} h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2 ring-white transition hover:z-40 dark:ring-neutral-950`}
          >
            <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-700 transition group-hover/av:scale-110 dark:bg-neutral-800 dark:text-neutral-200">
              {a.avatarUrl ? (
                <Image
                  src={a.avatarUrl}
                  alt=""
                  width={36}
                  height={36}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </span>

            {/* Hover tooltip — name + peak rank. */}
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 origin-bottom scale-90 whitespace-nowrap rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left opacity-0 shadow-xl transition duration-150 group-hover/av:scale-100 group-hover/av:opacity-100 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <span className="block text-xs font-bold text-neutral-900 dark:text-white">
                {a.name}
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] text-neutral-500 uppercase">
                Peak
                {a.peakRank ? (
                  <RankBadge
                    value={a.peakRank}
                    size={14}
                    abbreviate
                    textClassName="text-[11px] font-bold normal-case tracking-normal text-thl-orange"
                  />
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </span>
              {/* little arrow */}
              <span className="absolute top-full left-1/2 -mt-1 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950" />
            </span>
          </span>
        );
      })}
    </Link>
  );
}
