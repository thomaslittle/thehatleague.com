"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { useAvailablePool } from "@/lib/draft/use-draft-live";
import { Plus, ArrowUp, ArrowDown, X } from "lucide-react";
import { rankWeight } from "@/lib/data/rank-sort";
import { RankBadge } from "@/components/ranks/rank-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setQueue } from "@/app/actions/draft-queue";
import type { DraftPerson } from "@/lib/data/draft";

/**
 * Captain queue builder. Left: searchable available pool. Right: the ordered
 * queue with move-up/down + remove. The order is local state; Save persists it
 * via `setQueue` (rank = index). Drafted players drop out of the pool live via
 * Realtime, and we filter them from the queue on render so a stale id can't
 * linger.
 */
export function QueueBoard({
  seasonId,
  teamId,
  teamName,
  initialQueue,
  initialPool,
}: {
  seasonId: string;
  teamId: string;
  teamName: string;
  initialQueue: DraftPerson[];
  initialPool: DraftPerson[];
}) {
  const pool = useAvailablePool(seasonId, initialPool);
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");

  // Queue is stored as ids; resolve against the live pool so drafted players
  // disappear automatically.
  const [queueIds, setQueueIds] = useState<string[]>(initialQueue.map((p) => p.id));
  const [dirty, setDirty] = useState(false);

  const poolById = useMemo(() => new Map(pool.map((p) => [p.id, p])), [pool]);
  const queue = useMemo(
    () => queueIds.map((id) => poolById.get(id)).filter((p): p is DraftPerson => Boolean(p)),
    [queueIds, poolById],
  );
  const queuedSet = useMemo(() => new Set(queueIds), [queueIds]);

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...pool]
      .filter((p) => !queuedSet.has(p.id))
      .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.username ?? "").toLowerCase().includes(q))
      .sort((a, b) => rankWeight(b.peakRank) - rankWeight(a.peakRank))
      .slice(0, 40);
  }, [pool, queuedSet, query]);

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const mutate = (next: string[]) => {
    setQueueIds(next);
    setDirty(true);
  };
  const add = (id: string) => mutate([...queueIds, id]);
  const remove = (id: string) => mutate(queueIds.filter((x) => x !== id));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= queueIds.length) return;
    const next = [...queueIds];
    [next[i], next[j]] = [next[j], next[i]];
    mutate(next);
  };
  // Drag-to-reorder: move the dragged id to the drop target's slot.
  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    const next = [...queueIds];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    mutate(next);
  };

  const save = () => {
    startTransition(async () => {
      const res = await setQueue(seasonId, teamId, queueIds);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Queue saved");
        setDirty(false);
      }
    });
  };

  return (
    <section className="mx-auto max-w-[1320px] px-6 pb-24 md:px-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-neutral-500">
          {teamName} · {queue.length} queued
        </div>
        <Button onClick={save} disabled={pending || !dirty}>
          {dirty ? "Save queue" : "Saved"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Available */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight">Available</h3>
            <span className="text-xs text-neutral-400">{pool.length - queue.length} left</span>
          </div>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players…"
            className="mt-3"
          />
          <ul className="mt-3 max-h-[28rem] space-y-1 overflow-y-auto">
            {available.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => add(p.id)}
                  className="flex w-full items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 text-left transition hover:border-thl-orange dark:border-neutral-800"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">{p.name}</span>
                  <RankBadge value={p.peakRank} size={16} abbreviate textClassName="text-xs font-bold" />
                  <Plus className="h-4 w-4 text-thl-orange" aria-hidden />
                </button>
              </li>
            ))}
            {available.length === 0 && <li className="px-1 py-4 text-sm text-neutral-500">No players.</li>}
          </ul>
        </div>

        {/* Queue */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <h3 className="text-lg font-bold tracking-tight">Your queue</h3>
          <ol className="mt-3 space-y-1">
            {queue.map((p, i) => (
              <li
                key={p.id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) reorder(dragIndex, i);
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
                className={`flex cursor-grab items-center gap-3 rounded-lg border px-3 py-2 active:cursor-grabbing dark:border-neutral-800 ${
                  dragIndex === i ? "border-thl-orange opacity-60" : "border-neutral-200"
                }`}
              >
                <span className="w-6 text-center text-lg font-bold text-thl-orange tabular-nums">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{p.name}</span>
                <RankBadge value={p.peakRank} size={16} abbreviate textClassName="text-xs font-bold" />
                <div className="flex shrink-0 items-center gap-1">
                  <IconBtn label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn label="Move down" onClick={() => move(i, 1)} disabled={i === queue.length - 1}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn label="Remove" onClick={() => remove(p.id)}>
                    <X className="h-3.5 w-3.5" />
                  </IconBtn>
                </div>
              </li>
            ))}
            {queue.length === 0 && (
              <li className="rounded-xl border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
                Add players from the left to build your board.
              </li>
            )}
          </ol>
        </div>
      </div>
    </section>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {children}
    </Button>
  );
}
