"use client";

import { useState, type ReactNode } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Optional initial sort applied on first render. */
  initialSorting?: SortingState;
  /** Optional empty-state node when `data` is empty. */
  emptyState?: ReactNode;
  /** Tailwind class on the outer card. */
  className?: string;
  /** Tailwind class on each row. */
  rowClassName?: string;
}

/**
 * Reusable TanStack + shadcn data table. Plug a `columns` array and a
 * `data` array in; users get free column sorting (click header), the
 * shadcn Table styling, and the existing brand chrome.
 *
 * Use `<DataTable.SortableHeader>` inside a column def's `header` to
 * render a clickable sort arrow that hooks into the table's sort state.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  initialSorting,
  emptyState,
  className,
  rowClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting ?? []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950",
        className,
      )}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b border-neutral-200 hover:bg-transparent dark:border-neutral-800"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="px-4 py-3 text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase md:px-6"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  "border-b border-neutral-100 transition hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-950",
                  rowClassName,
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="px-4 py-3 align-middle md:px-6 md:py-4"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="px-6 py-12 text-center text-sm text-neutral-500"
              >
                {emptyState ?? "Nothing here yet."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Click-to-sort table header. Pass it the column object TanStack hands
 * the header renderer (`header.column` / via column.getCanSort()).
 */
interface SortHeaderColumn {
  toggleSorting: (desc?: boolean) => void;
  getIsSorted: () => false | "asc" | "desc";
  getCanSort: () => boolean;
}

DataTable.SortableHeader = function SortableHeader({
  column,
  children,
  align = "left",
}: {
  column: SortHeaderColumn;
  children: ReactNode;
  align?: "left" | "right" | "center";
}) {
  if (!column.getCanSort()) {
    return <span className={alignClass(align)}>{children}</span>;
  }
  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className={cn(
        "inline-flex w-full items-center gap-1 text-[10px] font-bold tracking-[0.18em] uppercase transition hover:text-thl-orange",
        align === "right" && "justify-end",
        align === "center" && "justify-center",
        sorted ? "text-thl-orange" : "text-neutral-500",
      )}
    >
      <span>{children}</span>
      <SortArrow sorted={sorted} />
    </button>
  );
};

function SortArrow({ sorted }: { sorted: false | "asc" | "desc" }) {
  return (
    <svg
      viewBox="0 0 12 12"
      width="12"
      height="12"
      className={cn(
        "shrink-0 transition",
        sorted ? "opacity-100" : "opacity-40",
      )}
      aria-hidden
    >
      <path
        d="M3 5 L6 2 L9 5"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        className={cn(sorted === "desc" ? "opacity-30" : "opacity-100")}
      />
      <path
        d="M3 7 L6 10 L9 7"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        className={cn(sorted === "asc" ? "opacity-30" : "opacity-100")}
      />
    </svg>
  );
}

function alignClass(align: "left" | "right" | "center") {
  return align === "right"
    ? "block text-right"
    : align === "center"
      ? "block text-center"
      : "block text-left";
}
