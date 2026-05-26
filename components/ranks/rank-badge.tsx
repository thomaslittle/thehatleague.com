import Image from "next/image";
import { rankIconSrc } from "@/lib/data/rank-icons";
import { rankAbbrev } from "@/lib/data/rocket-league-ranks";
import { cn } from "@/lib/cn";

/**
 * Renders a Rocket League rank: real in-game tier icon + the text label.
 * Falls back to text-only if the value doesn't match a known tier.
 */
export function RankBadge({
  value,
  size = 24,
  textClassName,
  className,
  showText = true,
  emphasis = "default",
  abbreviate = false,
}: {
  value: string | null | undefined;
  size?: number;
  textClassName?: string;
  className?: string;
  showText?: boolean;
  emphasis?: "default" | "highlight" | "muted";
  /** When true, render the short-form tier (e.g. "GC1") instead of the full
   *  name. Useful in narrow chips where "Grand Champion I" overflows. */
  abbreviate?: boolean;
}) {
  const icon = rankIconSrc(value);
  const label = abbreviate ? rankAbbrev(value) : (value ?? "—");
  // Source PNGs are 150×100. The `size` prop is treated as the rendered
  // HEIGHT; width is derived to preserve the 3:2 ratio so the rank shapes
  // (diamond, star, crown, etc.) don't get squashed.
  const iconHeight = size;
  const iconWidth = Math.round(size * 1.5);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap",
        className,
      )}
    >
      {icon ? (
        <Image
          src={icon}
          alt=""
          width={iconWidth}
          height={iconHeight}
          className="shrink-0"
          aria-hidden
        />
      ) : (
        <span
          aria-hidden
          className="inline-block shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800"
          style={{ width: iconHeight, height: iconHeight }}
        />
      )}
      {showText && (
        <span
          className={cn(
            "font-semibold tabular-nums",
            emphasis === "highlight" && "text-thl-orange",
            emphasis === "muted" && "text-neutral-500",
            textClassName,
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}
