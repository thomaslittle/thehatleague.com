import Image from "next/image";
import { RankBadge } from "@/components/ranks/rank-badge";
import type { FnfPlayerCard } from "@/lib/data/fnf";
import { cn } from "@/lib/cn";

/** Compact player chip: avatar, name, and 2v2 rank. */
export function PlayerChip({
  player,
  className,
  draggable,
  onDragStart,
}: {
  player: FnfPlayerCard;
  className?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 dark:border-neutral-800 dark:bg-neutral-900",
        draggable && "cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      {player.avatarUrl ? (
        <Image
          src={player.avatarUrl}
          alt=""
          width={28}
          height={28}
          className="size-7 shrink-0 rounded-full object-cover"
          aria-hidden
        />
      ) : (
        <span className="size-7 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800" />
      )}
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
        {player.name}
      </span>
      <RankBadge
        value={player.rankValue}
        size={18}
        abbreviate
        showText={false}
      />
    </div>
  );
}
