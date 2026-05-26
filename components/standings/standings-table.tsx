"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import type { StandingRow } from "@/lib/data/season3-standings";

interface StandingsTableProps {
  teams: StandingRow[];
  /** Hide secondary columns (GP/GF/GA) to compress for narrow contexts. */
  compact?: boolean;
}

export function StandingsTable({ teams, compact = false }: StandingsTableProps) {
  const columns = useMemo<ColumnDef<StandingRow>[]>(() => {
    const base: ColumnDef<StandingRow>[] = [
      {
        id: "seed",
        accessorFn: (row) => row.seed,
        sortingFn: "basic",
        header: ({ column }) => (
          <DataTable.SortableHeader column={column} align="center">
            #
          </DataTable.SortableHeader>
        ),
        cell: ({ row }) => (
          <span className="block text-center font-extrabold tabular-nums text-thl-orange">
            {String(row.original.seed).padStart(2, "0")}
          </span>
        ),
      },
      {
        id: "team",
        accessorFn: (row) => row.name.toLowerCase(),
        header: ({ column }) => (
          <DataTable.SortableHeader column={column}>Team</DataTable.SortableHeader>
        ),
        cell: ({ row, table }) => {
          const isLeader =
            table.getState().sorting[0]?.id === "seed" &&
            !table.getState().sorting[0]?.desc &&
            row.original.seed === 1;
          return (
            <span className="flex items-center gap-2 truncate font-semibold text-neutral-900 dark:text-white">
              <span className="truncate">{row.original.name}</span>
              {isLeader && (
                <span className="hidden rounded-md bg-thl-orange/15 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.16em] text-thl-orange uppercase lg:inline-flex">
                  Champ
                </span>
              )}
            </span>
          );
        },
      },
    ];

    if (!compact) {
      base.push({
        id: "gp",
        accessorFn: (row) => row.gp,
        sortingFn: "basic",
        header: ({ column }) => (
          <DataTable.SortableHeader column={column} align="center">
            GP
          </DataTable.SortableHeader>
        ),
        cell: ({ row }) => (
          <span className="block text-center tabular-nums text-neutral-600 dark:text-neutral-400">
            {row.original.gp}
          </span>
        ),
      });
    }

    base.push({
      id: "record",
      accessorFn: (row) => row.w,
      sortingFn: "basic",
      header: ({ column }) => (
        <DataTable.SortableHeader column={column} align="center">
          W/L
        </DataTable.SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="block text-center font-semibold tabular-nums whitespace-nowrap text-neutral-900 dark:text-white">
          {row.original.w}–{row.original.l}
        </span>
      ),
    });

    if (!compact) {
      base.push(
        {
          id: "gf",
          accessorFn: (row) => row.gf,
          sortingFn: "basic",
          header: ({ column }) => (
            <DataTable.SortableHeader column={column} align="center">
              GF
            </DataTable.SortableHeader>
          ),
          cell: ({ row }) => (
            <span className="block text-center tabular-nums text-neutral-600 dark:text-neutral-400">
              {row.original.gf}
            </span>
          ),
        },
        {
          id: "ga",
          accessorFn: (row) => row.ga,
          sortingFn: "basic",
          header: ({ column }) => (
            <DataTable.SortableHeader column={column} align="center">
              GA
            </DataTable.SortableHeader>
          ),
          cell: ({ row }) => (
            <span className="block text-center tabular-nums text-neutral-600 dark:text-neutral-400">
              {row.original.ga}
            </span>
          ),
        },
      );
    }

    base.push({
      id: "diff",
      accessorFn: (row) => row.gf - row.ga,
      sortingFn: "basic",
      header: ({ column }) => (
        <DataTable.SortableHeader column={column} align="right">
          Diff
        </DataTable.SortableHeader>
      ),
      cell: ({ row }) => {
        const diff = row.original.gf - row.original.ga;
        return (
          <span
            className={`block text-right font-bold tabular-nums ${
              diff > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : diff < 0
                  ? "text-rose-500"
                  : "text-neutral-500"
            }`}
          >
            {diff > 0 ? "+" : ""}
            {diff}
          </span>
        );
      },
    });

    return base;
  }, [compact]);

  return (
    <DataTable
      columns={columns}
      data={teams}
      initialSorting={[{ id: "seed", desc: false }]}
      className="rounded-none border-x-0 border-t-0"
      rowClassName="text-sm"
    />
  );
}
