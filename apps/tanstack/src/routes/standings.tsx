import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowRight } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import {
  CHALLONGE_BRACKETS,
  FEDORA_PLAYOFFS_S3,
  FEDORA_S3,
  SOMBRERO_PLAYOFFS_S3,
  SOMBRERO_S3,
  type PlayoffRow,
  type StandingRow,
} from "@/lib/season3-standings";
import { ogMeta } from "@/lib/og";

const BRACKETS = [
  {
    label: "Sombrero · Regular season",
    href: CHALLONGE_BRACKETS.sombreroRegular,
    tag: "Regular" as const,
  },
  {
    label: "Fedora · Regular season",
    href: CHALLONGE_BRACKETS.fedoraRegular,
    tag: "Regular" as const,
  },
  {
    label: "Sombrero · Play-In",
    href: CHALLONGE_BRACKETS.playInSombrero,
    tag: "Play-in" as const,
  },
  {
    label: "Fedora · Play-In",
    href: CHALLONGE_BRACKETS.playInFedora,
    tag: "Play-in" as const,
  },
  {
    label: "Sombrero · Playoffs",
    href: CHALLONGE_BRACKETS.sombreroPlayoffs,
    tag: "Playoffs" as const,
  },
  {
    label: "Fedora · Playoffs",
    href: CHALLONGE_BRACKETS.fedoraPlayoffs,
    tag: "Playoffs" as const,
  },
];

export const Route = createFileRoute("/standings")({
  component: StandingsPage,
  head: () => ({
    meta: ogMeta({
      title: "Standings · The Hat League",
      description:
        "Season 3 final standings (Fedora + Sombrero). Season 4 live standings land after draft.",
      dynamic: true,
    }),
  }),
});

function StandingsPage() {
  const sombreroChamp = SOMBRERO_PLAYOFFS_S3[0]!;
  const fedoraChamp = FEDORA_PLAYOFFS_S3[0]!;

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="flex-1">
        <PageHero
          eyebrow="Season 03 · Final standings"
          title="The receipts."
          accent="Two conferences."
          subtitle={
            <>
              Season 3 ended with{" "}
              <span className="font-semibold text-thl-orange">
                {sombreroChamp.name}
              </span>{" "}
              taking the Sombrero hat and{" "}
              <span className="font-semibold text-thl-orange">
                {fedoraChamp.name}
              </span>{" "}
              taking the Fedora. Regular-season tables below; playoff
              finishes beneath each.
            </>
          }
        />

        <section className="mx-auto max-w-[1320px] px-6 pb-16 md:px-10">
          <div className="grid gap-6 lg:grid-cols-2">
            <ConfBlock
              title="Sombrero Conference"
              sub="Western · 10 teams · S03"
              rows={SOMBRERO_S3}
              playoffs={SOMBRERO_PLAYOFFS_S3}
              regularHref={CHALLONGE_BRACKETS.sombreroRegular}
              playoffsHref={CHALLONGE_BRACKETS.sombreroPlayoffs}
              playInHref={CHALLONGE_BRACKETS.playInSombrero}
            />
            <ConfBlock
              title="Fedora Conference"
              sub="Eastern · 10 teams · S03"
              rows={FEDORA_S3}
              playoffs={FEDORA_PLAYOFFS_S3}
              regularHref={CHALLONGE_BRACKETS.fedoraRegular}
              playoffsHref={CHALLONGE_BRACKETS.fedoraPlayoffs}
              playInHref={CHALLONGE_BRACKETS.playInFedora}
            />
          </div>
        </section>

        <section className="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950">
          <div className="mx-auto max-w-[1320px] px-6 py-14 md:px-10 md:py-16">
            <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
              Original brackets · Challonge
            </div>
            <h2 className="mt-2 text-2xl leading-tight font-bold tracking-tight md:text-3xl">
              Open any bracket in Challonge.
            </h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {BRACKETS.map((b) => (
                <a
                  key={b.href}
                  href={b.href}
                  target="_blank"
                  rel="noopener"
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-black"
                >
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                      {b.tag}
                    </div>
                    <div className="mt-0.5 text-sm font-bold">{b.label}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-thl-orange transition group-hover:translate-x-1" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-20">
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 md:p-12 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Reserved · Season 04 live standings
            </div>
            <h3 className="mt-3 font-marker text-3xl md:text-4xl">
              Live standings render here once Season 4 kicks off.
            </h3>
            <p className="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
              We&apos;ll wire this directly to ballchasing.com once the
              draft sets the league structure.
            </p>
            <Link
              to="/the-draft"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-thl-orange px-4 py-2.5 text-sm font-bold text-black hover:bg-thl-orange-deep"
            >
              See draft info <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ConfBlock({
  title,
  sub,
  rows,
  playoffs,
  regularHref,
  playoffsHref,
  playInHref,
}: {
  title: string;
  sub: string;
  rows: StandingRow[];
  playoffs: PlayoffRow[];
  regularHref: string;
  playoffsHref: string;
  playInHref: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
        <div>
          <div className="font-marker text-2xl md:text-3xl">{title}</div>
          <div className="mt-1.5 text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
            {sub}
          </div>
        </div>
        <span className="rounded-md bg-thl-orange px-2.5 py-1 text-[10px] font-extrabold tracking-[0.18em] text-black">
          S03
        </span>
      </div>

      <StandingsTable teams={rows} />

      <div className="border-t border-neutral-200 bg-neutral-50/60 px-6 py-5 dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            Playoff finish
          </div>
          <span className="text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase">
            8 teams · double-elim
          </span>
        </div>
        <ol className="mt-3 grid gap-1.5">
          {playoffs.map((p, i) => (
            <li
              key={`${p.rank}-${p.name}`}
              className={`flex items-center gap-3 rounded-md px-2 py-1.5 text-sm ${
                i === 0
                  ? "bg-thl-orange/15 font-bold text-thl-orange"
                  : "text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <span className="w-6 text-center font-extrabold tabular-nums">
                {p.rank}
              </span>
              <span className="min-w-0 truncate">
                {i === 0 && "★ "}
                {p.name}
              </span>
              {p.captain && (
                <span className="ml-auto truncate text-xs text-neutral-500">
                  {p.captain}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 px-6 py-3 text-[11px] dark:border-neutral-800">
        <a
          href={regularHref}
          target="_blank"
          rel="noopener"
          className="font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          Regular season ↗
        </a>
        <a
          href={playInHref}
          target="_blank"
          rel="noopener"
          className="font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          Play-in ↗
        </a>
        <a
          href={playoffsHref}
          target="_blank"
          rel="noopener"
          className="font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          Playoffs ↗
        </a>
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
        cell: ({ row }) => (
          <span className="truncate font-semibold text-neutral-900 dark:text-white">
            {row.original.name}
          </span>
        ),
      },
      {
        id: "record",
        accessorFn: (row) => row.w,
        sortingFn: "basic",
        header: "W-L",
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
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-950"
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
