"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { RankBadge } from "@/components/ranks/rank-badge";
import { rankWeight } from "@/lib/data/rank-sort";
import type { PoolRow } from "@/lib/data/pool";
import type { SortKey } from "@/components/pool/pool-board";

// Map the toolbar's sort dropdown onto the table's column-sort state so
// switching into list view lands on the column the user already chose.
// Ranks + recency both read best/newest-first, hence desc.
const SORT_TO_COLUMN: Record<SortKey, SortingState> = {
  peak: [{ id: "peak", desc: true }],
  rank_3v3: [{ id: "rank_3v3", desc: true }],
  rank_2v2: [{ id: "rank_2v2", desc: true }],
  joined: [{ id: "joined", desc: true }],
};

function joinedLabel(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PoolTable({
  rows,
  sort,
}: {
  rows: PoolRow[];
  sort: SortKey;
}) {
  const columns = useMemo<ColumnDef<PoolRow>[]>(
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
          const avatarUrl = p.profile_avatar_url ?? p.discord_avatar_url;
          return (
            <div className="flex min-w-0 items-center gap-3">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
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
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold">
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
                  </span>
                  {p.is_captain && (
                    <span className="shrink-0 rounded-md bg-thl-orange/15 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.16em] text-thl-orange uppercase">
                      Captain
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-neutral-500">
                  @{p.discord_username ?? "—"}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "rank_2v2",
        accessorFn: (row) => rankWeight(row.rank_2v2),
        sortingFn: "basic",
        header: ({ column }) => (
          <DataTable.SortableHeader column={column}>
            2v2
          </DataTable.SortableHeader>
        ),
        cell: ({ row }) => (
          <RankBadge
            value={row.original.rank_2v2}
            size={18}
            abbreviate
            textClassName="text-sm font-semibold whitespace-nowrap"
          />
        ),
      },
      {
        id: "rank_3v3",
        accessorFn: (row) => rankWeight(row.rank_3v3),
        sortingFn: "basic",
        header: ({ column }) => (
          <DataTable.SortableHeader column={column}>
            3v3
          </DataTable.SortableHeader>
        ),
        cell: ({ row }) => (
          <RankBadge
            value={row.original.rank_3v3}
            size={18}
            abbreviate
            textClassName="text-sm font-semibold whitespace-nowrap"
          />
        ),
      },
      {
        id: "peak",
        accessorFn: (row) => rankWeight(row.peak_rank),
        sortingFn: "basic",
        header: ({ column }) => (
          <DataTable.SortableHeader column={column}>
            Peak
          </DataTable.SortableHeader>
        ),
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex flex-col gap-0.5">
              <RankBadge
                value={p.peak_rank}
                size={18}
                abbreviate
                textClassName="text-sm font-semibold text-thl-orange whitespace-nowrap"
              />
              {p.peak_rank_playlist && (
                <span className="text-[10px] font-bold tracking-[0.16em] text-neutral-400 uppercase">
                  {p.peak_rank_playlist}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "joined",
        accessorFn: (row) =>
          row.created_at ? new Date(row.created_at).getTime() : 0,
        sortingFn: "basic",
        header: ({ column }) => (
          <DataTable.SortableHeader column={column}>
            Joined
          </DataTable.SortableHeader>
        ),
        cell: ({ row }) => (
          <span className="text-sm whitespace-nowrap text-neutral-500">
            {joinedLabel(row.original.created_at)}
          </span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => (
          <span className="block text-right text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase">
            Links
          </span>
        ),
        cell: ({ row }) => {
          const p = row.original;
          const profileHref = p.discord_username
            ? `/players/${encodeURIComponent(p.discord_username)}`
            : null;
          return (
            <div className="flex items-center justify-end gap-3 text-xs font-semibold whitespace-nowrap">
              {profileHref && (
                <Link
                  href={profileHref}
                  className="text-thl-orange underline-offset-4 hover:underline"
                >
                  Profile →
                </Link>
              )}
              {p.rl_tracker_url && (
                <a
                  href={p.rl_tracker_url}
                  target="_blank"
                  rel="noopener"
                  className="text-neutral-500 underline-offset-4 hover:text-thl-orange hover:underline"
                >
                  Tracker ↗
                </a>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      initialSorting={SORT_TO_COLUMN[sort]}
      emptyState="No players match those filters."
    />
  );
}
