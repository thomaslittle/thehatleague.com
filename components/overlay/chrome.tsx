import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Shared, server-safe (no hooks) broadcast chrome for every OBS overlay so
// they all carry the same Hat League look: dark glass panels, an accent edge
// in the team/brand colour, dotted texture, corner ticks and motion.

export const OVL_ORANGE = "var(--color-thl-orange)";

const PLACE = {
  center: "items-center justify-center",
  left: "items-center justify-start",
  bottom: "items-end justify-center",
  top: "items-start justify-center",
  "top-left": "items-start justify-start",
} as const;

/** Full-frame (1920×1080) positioning stage. */
export function Stage({
  children,
  place = "center",
  className,
}: {
  children: ReactNode;
  place?: keyof typeof PLACE;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-screen w-full p-14", PLACE[place], className)}>
      {children}
    </div>
  );
}

/** The THL roundel — small brand mark used across overlays. */
export function BrandMark({ size = 34, ring = true }: { size?: number; ring?: boolean }) {
  return (
    <Image
      src="/brand/thl-logo-notext.png"
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full", ring && "ring-1 ring-white/20")}
      style={{ width: size, height: size }}
    />
  );
}

export function Kicker({ children, accent = OVL_ORANGE }: { children: ReactNode; accent?: string }) {
  return (
    <span className="text-[15px] leading-none font-extrabold tracking-[0.32em] uppercase" style={{ color: accent }}>
      {children}
    </span>
  );
}

/**
 * The signature branded panel. Dark glass with an accent edge that glows and
 * sweeps, dotted texture, corner ticks, and an optional header (brand mark +
 * kicker + meta).
 */
export function Panel({
  children,
  accent = OVL_ORANGE,
  kicker,
  meta,
  brand = true,
  padded = true,
  className,
  style,
}: {
  children: ReactNode;
  accent?: string;
  kicker?: ReactNode;
  meta?: ReactNode;
  brand?: boolean;
  padded?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "thl-ovl-rise relative overflow-hidden rounded-[28px] text-white shadow-[0_44px_130px_-32px_rgba(0,0,0,0.9)] ring-1 ring-white/10",
        className,
      )}
      style={style}
    >
      {/* Glass base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c10]/95 via-black/90 to-[#0c0c10]/95 backdrop-blur-2xl" />
      {/* Dotted texture */}
      <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:22px_22px]" />
      {/* Accent corner glow */}
      <div
        className="thl-ovl-pulse absolute -top-28 -left-16 h-56 w-72 blur-3xl"
        style={{ background: `radial-gradient(60% 60% at 30% 60%, ${accent}, transparent 70%)` }}
      />
      {/* Accent edge bar with travelling sweep */}
      <div className="absolute inset-x-0 top-0 h-[5px] overflow-hidden" style={{ background: accent }}>
        <span className="thl-ovl-sweep absolute inset-y-0 left-0 w-1/4 bg-white/55 blur-[2px]" />
      </div>
      {/* Soft inner top highlight for depth (no hard corner marks). */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-[5px] h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)` }}
      />

      <div className={cn("relative", padded && "p-9")}>
        {(brand || kicker || meta) && (
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {brand && <BrandMark />}
              {kicker && <Kicker accent={accent}>{kicker}</Kicker>}
            </div>
            {meta && (
              <div className="text-sm font-bold tracking-[0.2em] whitespace-nowrap text-white/55 uppercase">
                {meta}
              </div>
            )}
          </header>
        )}
        {children}
      </div>
    </div>
  );
}

/** A ranked-list rank chip (#1 highlighted). */
export function RankNum({ n, accent = OVL_ORANGE }: { n: number; accent?: string }) {
  const top = n === 1;
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black tabular-nums"
      style={
        top
          ? { background: accent, color: "#0a0a0a" }
          : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }
      }
    >
      {n}
    </span>
  );
}

/** A small colour dot for a team. */
export function TeamDot({ color, size = 10 }: { color: string | null; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full ring-1 ring-white/20"
      style={{ width: size, height: size, background: color ?? OVL_ORANGE }}
    />
  );
}
