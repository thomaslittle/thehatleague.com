import { useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "@/components/icons";
import {
  FEDORA_S3,
  SOMBRERO_S3,
  type StandingRow,
} from "@/lib/season3-standings";

const TABS = [
  { key: "top6", label: "Top 6", shortLabel: "Top 6" },
  { key: "full", label: "Full table", shortLabel: "Full" },
  { key: "bracket", label: "Playoff bracket", shortLabel: "Bracket" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export function Standings() {
  const [tab, setTab] = useState<Tab>("top6");

  return (
    <section className="bg-white dark:bg-black">
      <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-28">
        <div className="mb-10 grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-3 text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
              Season 03 · Final standings
            </div>
            <h2 className="text-4xl leading-[0.98] font-bold tracking-[-0.03em] text-neutral-900 md:text-5xl lg:text-6xl dark:text-white">
              Two conferences.{" "}
              <span className="font-marker font-normal text-thl-orange">
                One hat.
              </span>
            </h2>
          </div>
          <div
            role="tablist"
            className="grid w-full grid-cols-3 gap-1 rounded-lg border border-neutral-200 bg-neutral-100 p-1 md:inline-flex md:w-auto dark:border-neutral-800 dark:bg-neutral-900"
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold whitespace-nowrap transition md:px-3.5 ${
                  tab === t.key
                    ? "bg-thl-orange text-black"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <span className="md:hidden">{t.shortLabel}</span>
                <span className="hidden md:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {tab === "bracket" ? (
          <BracketPlaceholder />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <ConfCard
              name="Fedora Conference"
              sub="Eastern bracket · 11 teams"
              teams={tab === "full" ? FEDORA_S3 : FEDORA_S3.slice(0, 6)}
              total={FEDORA_S3.length}
            />
            <ConfCard
              name="Sombrero Conference"
              sub="Western bracket · 11 teams"
              teams={tab === "full" ? SOMBRERO_S3 : SOMBRERO_S3.slice(0, 6)}
              total={SOMBRERO_S3.length}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function ConfCard({
  name,
  sub,
  teams,
  total,
}: {
  name: string;
  sub: string;
  teams: StandingRow[];
  total: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
        <div>
          <div className="font-marker text-2xl text-neutral-900 md:text-3xl dark:text-white">
            {name}
          </div>
          <div className="mt-1.5 text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
            {sub}
          </div>
        </div>
        <span className="rounded-md bg-thl-orange px-2.5 py-1 text-[10px] font-extrabold tracking-[0.18em] text-black">
          S03
        </span>
      </div>

      <StandingsTable teams={teams} />

      <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4 text-xs dark:border-neutral-800">
        <span className="text-neutral-500">
          Showing {teams.length} of {total} teams
        </span>
        <Link
          to="/standings"
          className="inline-flex items-center gap-1.5 font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          Full standings <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function StandingsTable({ teams }: { teams: StandingRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "seed", desc: false },
  ]);

  const columns = useMemo<ColumnDef<StandingRow>[]>(
    () => [
      {
        id: "seed",
        accessorFn: (row) => row.seed,
        sortingFn: "basic",
        header: "#",
        cell: ({ row }) => (
          <span className="block text-center font-extrabold tabular-nums text-thl-orange">
            {String(row.original.seed).padStart(2, "0")}
          </span>
        ),
      },
      {
        id: "team",
        accessorFn: (row) => row.name.toLowerCase(),
        header: "Team",
        cell: ({ row, table }) => {
          const isLeaderInSeedSort =
            table.getState().sorting[0]?.id === "seed" &&
            !table.getState().sorting[0]?.desc &&
            row.original.seed === 1;
          return (
            <span className="flex items-center gap-2 truncate font-semibold text-neutral-900 dark:text-white">
              <span className="truncate">{row.original.name}</span>
              {isLeaderInSeedSort && (
                <span className="hidden rounded-md bg-thl-orange/15 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.16em] text-thl-orange uppercase lg:inline-flex">
                  Champ
                </span>
              )}
            </span>
          );
        },
      },
      {
        id: "record",
        accessorFn: (row) => row.w,
        sortingFn: "basic",
        header: "Record",
        cell: ({ row }) => (
          <span className="block text-center font-bold tabular-nums text-neutral-700 dark:text-neutral-300">
            {row.original.w}-{row.original.l}
          </span>
        ),
      },
      {
        id: "gd",
        accessorFn: (row) => row.gf - row.ga,
        sortingFn: "basic",
        header: "GD",
        cell: ({ getValue }) => {
          const gd = getValue<number>();
          return (
            <span
              className={
                "block text-right font-extrabold tabular-nums " +
                (gd > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : gd < 0
                    ? "text-rose-500 dark:text-rose-400"
                    : "text-neutral-500")
              }
            >
              {gd > 0 ? `+${gd}` : gd}
            </span>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: teams,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr
              key={hg.id}
              className="border-b border-neutral-200 text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase dark:border-neutral-800"
            >
              {hg.headers.map((h, idx) => {
                const sort = h.column.getIsSorted();
                const align =
                  h.column.id === "team"
                    ? "text-left"
                    : h.column.id === "gd"
                      ? "text-right"
                      : "text-center";
                return (
                  <th
                    key={h.id}
                    className={
                      "py-3 font-bold " +
                      align +
                      " " +
                      (idx === 0
                        ? "pl-6"
                        : idx === hg.headers.length - 1
                          ? "pr-6"
                          : "")
                    }
                  >
                    <button
                      type="button"
                      onClick={h.column.getToggleSortingHandler()}
                      className={
                        "inline-flex items-center gap-1 transition hover:text-thl-orange " +
                        (sort ? "text-thl-orange" : "")
                      }
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {sort === "asc" && <span aria-hidden>↑</span>}
                      {sort === "desc" && <span aria-hidden>↓</span>}
                    </button>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const isFirstAndSeedSort =
              row.index === 0 &&
              sorting[0]?.id === "seed" &&
              !sorting[0]?.desc;
            return (
              <tr
                key={row.id}
                className={
                  isFirstAndSeedSort
                    ? "bg-thl-orange/10"
                    : "border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-950"
                }
              >
                {row.getVisibleCells().map((cell, idx) => (
                  <td
                    key={cell.id}
                    className={
                      "py-3 " +
                      (idx === 0
                        ? "pl-6"
                        : idx === 1
                          ? "pl-2"
                          : idx === row.getVisibleCells().length - 1
                            ? "pr-6"
                            : "")
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BracketPlaceholder() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-8 py-12 text-center md:py-16 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-xl">
        <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
          Bracket · Season 03
        </div>
        <h3 className="mt-3 font-marker text-3xl text-neutral-900 md:text-4xl dark:text-white">
          The full playoff trees live on Challonge.
        </h3>
        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
          Sombrero and Fedora playoffs, plus the play-in tournaments, are
          embedded on the standings page so you can scrub through the
          double-elim trees.
        </p>
        <Link
          to="/standings"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3 font-bold text-black transition hover:bg-thl-orange-deep"
        >
          Open all brackets
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
