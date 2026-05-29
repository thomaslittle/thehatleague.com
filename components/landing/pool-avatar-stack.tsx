import Image from "next/image";
import Link from "next/link";
import type { PoolAvatar } from "@/lib/auth/viewer";
import { RankBadge } from "@/components/ranks/rank-badge";

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17.8l-6.1 2.4 1.5-6.7L2.3 8.9l6.8-.7z" />
    </svg>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M3 7l4.5 4L12 4l4.5 7L21 7l-1.7 10.5H4.7z" />
    </svg>
  );
}

const ROLE_META = {
  ops: {
    ring: "ring-thl-orange",
    badge: "bg-thl-orange text-black",
    label: "League Ops",
    labelClass: "text-thl-orange",
    Icon: CrownIcon,
  },
  captain: {
    ring: "ring-sky-400",
    badge: "bg-sky-500 text-white",
    label: "Captain",
    labelClass: "text-sky-500 dark:text-sky-400",
    Icon: StarIcon,
  },
} as const;

/**
 * Social-proof avatar group for the hero. Far-left is the THL logo carrying a
 * badge with the total pool count; pool members' avatars stack and overlap to
 * its right. Captains and league ops get a colored ring + corner badge around
 * their circle, and every avatar has a hover tooltip (role + name + peak rank).
 *
 * Faces reveal progressively by breakpoint (the count badge always shows the
 * true total) so the row never overflows or clips a half-avatar.
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
    <div
      className={`group/stack inline-flex max-w-full items-center -space-x-2.5 py-1 ${className ?? ""}`}
    >
      {/* Logo + count badge (far left, on top) — links to the full pool. */}
      <Link
        href="/pool"
        aria-label={`${count} players in the pool — view the player pool`}
        className="relative z-30 shrink-0"
      >
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
      </Link>

      {/* Pool member avatars, overlapping rightward — each links to its
          player profile. */}
      {shown.map((a, i) => {
        const initials = a.name.slice(0, 2).toUpperCase();
        const role = a.role ? ROLE_META[a.role] : null;
        const href = a.username
          ? `/players/${encodeURIComponent(a.username)}`
          : "/pool";
        // Reveal more faces as the viewport widens so the row never overflows
        // (or clips a half-avatar) on narrow screens.
        const display =
          i < 6
            ? "inline-flex"
            : i < 10
              ? "hidden sm:inline-flex"
              : i < 14
                ? "hidden md:inline-flex"
                : "hidden lg:inline-flex";
        return (
          <Link
            key={a.id}
            href={href}
            aria-label={role ? `${a.name} — ${role.label}` : a.name}
            style={{ zIndex: 20 - i }}
            className={`group/av relative ${display} h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:z-40 ${
              role
                ? `ring-[3px] ${role.ring}`
                : "ring-2 ring-white dark:ring-neutral-950"
            }`}
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

            {/* Role badge around the circle (captain / league ops). */}
            {role && (
              <span
                className={`absolute -top-1.5 -right-1.5 z-20 inline-flex h-[22px] w-[22px] items-center justify-center rounded-full shadow-md ring-2 ring-white dark:ring-neutral-950 ${role.badge}`}
              >
                <role.Icon className="h-3.5 w-3.5" />
              </span>
            )}

            {/* Hover tooltip — role + name + peak rank. */}
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 origin-bottom scale-90 whitespace-nowrap rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left opacity-0 shadow-xl transition duration-150 group-hover/av:scale-100 group-hover/av:opacity-100 dark:border-neutral-800 dark:bg-neutral-950"
            >
              {role && (
                <span
                  className={`mb-1 flex items-center gap-1 text-[9px] font-bold tracking-[0.16em] uppercase ${role.labelClass}`}
                >
                  <role.Icon className="h-2.5 w-2.5" />
                  {role.label}
                </span>
              )}
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
          </Link>
        );
      })}
    </div>
  );
}
