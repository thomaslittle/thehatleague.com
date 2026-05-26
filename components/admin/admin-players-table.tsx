"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { RankBadge } from "@/components/ranks/rank-badge";
import { setPlayerAdmin, setPlayerInPool } from "@/app/actions/admin";
import { rankWeight } from "@/lib/data/rank-sort";

export interface AdminPlayerRow {
  id: string;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  peak_rank: string | null;
  peak_rank_playlist: string | null;
  rank_2v2: string | null;
  rank_3v3: string | null;
  in_player_pool: boolean;
  is_captain: boolean;
  is_captain_applicant: boolean;
  is_admin: boolean;
  created_at: string;
}

export function AdminPlayersTable({
  players,
  actorId,
}: {
  players: AdminPlayerRow[];
  actorId: string;
}) {
  const columns = useMemo<ColumnDef<AdminPlayerRow>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) =>
          (
            row.discord_global_name ??
            row.discord_username ??
            "Unnamed"
          ).toLowerCase(),
        header: ({ column }) => (
          <DataTable.SortableHeader column={column}>
            Player
          </DataTable.SortableHeader>
        ),
        cell: ({ row }) => {
          const p = row.original;
          const name =
            p.discord_global_name ?? p.discord_username ?? "Unnamed";
          const profileHref = p.discord_username
            ? `/players/${encodeURIComponent(p.discord_username)}`
            : null;
          const isSelf = p.id === actorId;
          return (
            <div className="flex min-w-0 items-center gap-3">
              {p.discord_avatar_url ? (
                <Image
                  src={p.discord_avatar_url}
                  alt=""
                  width={36}
                  height={36}
                  unoptimized
                  className="h-9 w-9 shrink-0 rounded-full border border-neutral-200 dark:border-neutral-800"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-thl-orange text-xs font-bold text-black">
                  {name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">
                  {profileHref ? (
                    <Link
                      href={profileHref}
                      className="hover:text-thl-orange"
                    >
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                </div>
                <div className="truncate text-xs text-neutral-500">
                  @{p.discord_username ?? "—"}
                  {isSelf && " · you"}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "peak",
        accessorFn: (row) => rankWeight(row.peak_rank),
        sortingFn: "basic",
        header: ({ column }) => (
          <DataTable.SortableHeader column={column}>
            Peak rank
          </DataTable.SortableHeader>
        ),
        cell: ({ row }) => (
          <RankBadge
            value={row.original.peak_rank}
            size={18}
            textClassName="text-sm font-semibold truncate"
          />
        ),
      },
      {
        id: "status",
        accessorFn: (row) => {
          // Compose a sortable status priority: captains first, then
          // applicants, then partial (un-onboarded), then anyone else.
          const onboarded =
            row.rank_2v2 && row.rank_3v3 && row.peak_rank;
          if (row.is_captain) return 3;
          if (row.is_captain_applicant) return 2;
          if (!onboarded) return 1;
          return 0;
        },
        sortingFn: "basic",
        header: ({ column }) => (
          <DataTable.SortableHeader column={column}>
            Status
          </DataTable.SortableHeader>
        ),
        cell: ({ row }) => {
          const p = row.original;
          const isOnboarded = Boolean(
            p.rank_2v2 && p.rank_3v3 && p.peak_rank,
          );
          return (
            <div className="flex flex-wrap gap-1.5 text-[10px] font-bold tracking-[0.16em] uppercase">
              {!isOnboarded && (
                <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Partial
                </span>
              )}
              {p.is_captain && (
                <span className="rounded-md bg-thl-orange/15 px-1.5 py-0.5 text-thl-orange">
                  Captain
                </span>
              )}
              {!p.is_captain && p.is_captain_applicant && (
                <span className="rounded-md bg-neutral-200 px-1.5 py-0.5 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  Cap applied
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "pool",
        accessorFn: (row) => (row.in_player_pool ? 1 : 0),
        sortingFn: "basic",
        header: ({ column }) => (
          <DataTable.SortableHeader column={column}>
            Pool
          </DataTable.SortableHeader>
        ),
        cell: ({ row }) => {
          const p = row.original;
          return (
            <form action={setPlayerInPool}>
              <input type="hidden" name="profile_id" value={p.id} />
              <input
                type="hidden"
                name="next"
                value={p.in_player_pool ? "0" : "1"}
              />
              <button
                type="submit"
                className={
                  p.in_player_pool
                    ? "inline-flex w-full items-center justify-center rounded-md border border-thl-orange/40 bg-thl-orange/10 px-2 py-1 text-[11px] font-bold text-thl-orange hover:bg-thl-orange/15"
                    : "inline-flex w-full items-center justify-center rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-500 hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
                }
              >
                {p.in_player_pool ? "✓ In pool" : "Out — invite"}
              </button>
            </form>
          );
        },
      },
      {
        id: "admin",
        accessorFn: (row) => (row.is_admin ? 1 : 0),
        sortingFn: "basic",
        header: ({ column }) => (
          <DataTable.SortableHeader column={column} align="right">
            Admin
          </DataTable.SortableHeader>
        ),
        cell: ({ row }) => {
          const p = row.original;
          const isSelf = p.id === actorId;
          return (
            <form action={setPlayerAdmin} className="md:text-right">
              <input type="hidden" name="profile_id" value={p.id} />
              <input
                type="hidden"
                name="next"
                value={p.is_admin ? "0" : "1"}
              />
              <button
                type="submit"
                disabled={isSelf && p.is_admin}
                title={
                  isSelf && p.is_admin
                    ? "You can't demote yourself"
                    : undefined
                }
                className={
                  p.is_admin
                    ? "inline-flex items-center justify-center gap-1 rounded-md border border-thl-orange/40 bg-thl-orange/10 px-2 py-1 text-[11px] font-bold text-thl-orange hover:bg-thl-orange/15 disabled:cursor-not-allowed disabled:opacity-60"
                    : "inline-flex items-center justify-center gap-1 rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-500 hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
                }
              >
                {p.is_admin ? "★ Admin" : "Promote to admin"}
              </button>
            </form>
          );
        },
      },
    ],
    [actorId],
  );

  return (
    <DataTable
      columns={columns}
      data={players}
      initialSorting={[{ id: "name", desc: false }]}
      emptyState="No profiles yet."
    />
  );
}
