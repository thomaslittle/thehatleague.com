"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlayerChip } from "@/components/fnf/player-chip";
import { saveRosters } from "@/app/actions/fnf";
import type { FnfTeamCard, FnfPlayerCard } from "@/lib/data/fnf";
import { cn } from "@/lib/cn";

type DragData = { playerId: string; fromTeam: string };

/**
 * Roster grid. For admins it's drag-and-drop editable (move any player to any
 * team, then Save), so they can fine-tune what auto-generate produced. For
 * everyone else it's a read-only view of the matchups.
 */
export function TeamEditor({
  teams,
  tournamentId,
  editable,
}: {
  teams: FnfTeamCard[];
  tournamentId: string;
  editable: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rosters, setRosters] = useState<Map<string, FnfPlayerCard[]>>(
    () => new Map(teams.map((t) => [t.id, t.members])),
  );
  const [dirty, setDirty] = useState(false);
  const [dragTarget, setDragTarget] = useState<string | null>(null);

  const move = (data: DragData, toTeam: string) => {
    if (data.fromTeam === toTeam) return;
    setRosters((prev) => {
      const next = new Map(prev);
      let moved: FnfPlayerCard | undefined;
      for (const [tid, list] of next) {
        const idx = list.findIndex((p) => p.id === data.playerId);
        if (idx >= 0) {
          moved = list[idx];
          next.set(tid, list.filter((p) => p.id !== data.playerId));
          break;
        }
      }
      if (moved) next.set(toTeam, [...(next.get(toTeam) ?? []), moved]);
      return next;
    });
    setDirty(true);
  };

  const save = () =>
    startTransition(async () => {
      const payload = [...rosters.entries()].map(([teamId, list]) => ({
        teamId,
        profileIds: list.map((p) => p.id),
      }));
      const res = await saveRosters(tournamentId, payload);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Rosters saved.");
        setDirty(false);
        router.refresh();
      }
    });

  return (
    <div className="space-y-4">
      {editable && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">
            Drag players between teams to rebalance, then save.
          </p>
          <Button size="sm" onClick={save} disabled={!dirty || pending}>
            {pending ? "Saving…" : dirty ? "Save rosters" : "Saved"}
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const members = rosters.get(team.id) ?? [];
          return (
            <div
              key={team.id}
              onDragOver={
                editable
                  ? (e) => {
                      e.preventDefault();
                      setDragTarget(team.id);
                    }
                  : undefined
              }
              onDragLeave={editable ? () => setDragTarget(null) : undefined}
              onDrop={
                editable
                  ? (e) => {
                      e.preventDefault();
                      setDragTarget(null);
                      try {
                        const data = JSON.parse(
                          e.dataTransfer.getData("text/plain"),
                        ) as DragData;
                        move(data, team.id);
                      } catch {
                        /* ignore malformed drops */
                      }
                    }
                  : undefined
              }
              className={cn(
                "rounded-xl border border-neutral-200 bg-neutral-50/60 p-3 dark:border-neutral-800 dark:bg-neutral-900/40",
                dragTarget === team.id &&
                  "border-thl-orange ring-2 ring-thl-orange/30",
                members.length !== 2 &&
                  editable &&
                  "border-amber-400/60 dark:border-amber-500/40",
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold">{team.name}</span>
                <span className="text-[11px] font-semibold text-neutral-400">
                  #{team.seed}
                  {members.length !== 2 && editable
                    ? ` · ${members.length}p`
                    : ""}
                </span>
              </div>
              <div className="space-y-1.5">
                {members.map((p) => (
                  <PlayerChip
                    key={p.id}
                    player={p}
                    draggable={editable}
                    onDragStart={
                      editable
                        ? (e) =>
                            e.dataTransfer.setData(
                              "text/plain",
                              JSON.stringify({
                                playerId: p.id,
                                fromTeam: team.id,
                              } satisfies DragData),
                            )
                        : undefined
                    }
                  />
                ))}
                {members.length === 0 && (
                  <p className="py-2 text-center text-xs text-neutral-400">
                    Drop a player here
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
