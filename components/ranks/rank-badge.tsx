import Image from "next/image";
import { rankIconSrc } from "@/lib/data/rank-icons";
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
}: {
  value: string | null | undefined;
  size?: number;
  textClassName?: string;
  className?: string;
  showText?: boolean;
  emphasis?: "default" | "highlight" | "muted";
}) {
  const icon = rankIconSrc(value);
  const label = value ?? "—";
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
          width={size}
          height={size}
          className="shrink-0"
          aria-hidden
        />
      ) : (
        <span
          aria-hidden
          className="inline-block shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800"
          style={{ width: size, height: size }}
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
