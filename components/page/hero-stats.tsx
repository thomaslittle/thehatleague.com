import { cn } from "@/lib/utils";

/**
 * Featured social-proof stat block for hero sections. Surfaces the live
 * player-pool and captain counts so a first-time visitor instantly sees
 * there's real, active interest — the nudge to sign up themselves.
 *
 * Server-rendered (no client JS); the numbers come straight from the
 * cached count queries in `lib/auth/viewer`.
 */
export function HeroStats({
  poolCount,
  captainCount,
  className,
  heading = "The pool is filling up",
}: {
  poolCount: number;
  captainCount: number;
  className?: string;
  heading?: string;
}) {
  return (
    <div
      aria-label="Live league activity"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-thl-orange/30 bg-gradient-to-br from-thl-orange/10 via-white/60 to-white/20 p-5 shadow-[0_24px_70px_-30px_rgba(247,97,3,0.45)] backdrop-blur-sm md:p-6 dark:from-thl-orange/15 dark:via-neutral-950/60 dark:to-neutral-950/30",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-thl-orange/20 blur-2xl"
      />
      <div className="relative flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-thl-orange opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-thl-orange" />
        </span>
        <span className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
          Live · {heading}
        </span>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-3">
        <StatTile value={poolCount} label="In the pool" highlight />
        <StatTile value={captainCount} label="Captains" />
      </div>

      <p className="relative mt-4 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
        New hats drop in live — claim your spot before the draft locks.
      </p>
    </div>
  );
}

function StatTile({
  value,
  label,
  highlight = false,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3.5",
        highlight
          ? "border-transparent bg-thl-orange text-black shadow-[0_10px_30px_-12px_rgba(247,97,3,0.7)]"
          : "border-neutral-200 bg-white/70 dark:border-neutral-800 dark:bg-neutral-900/70",
      )}
    >
      <div
        className={cn(
          "font-marker text-4xl leading-none tabular-nums md:text-5xl",
          highlight ? "text-black" : "text-neutral-900 dark:text-white",
        )}
      >
        {value.toLocaleString()}
      </div>
      <div
        className={cn(
          "mt-1.5 text-[10px] font-bold tracking-[0.18em] uppercase",
          highlight ? "text-black/70" : "text-neutral-500",
        )}
      >
        {label}
      </div>
    </div>
  );
}
