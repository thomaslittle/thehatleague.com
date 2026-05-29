import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { rankIconSrc, rankWeight } from "@/lib/ranks";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getFullPool, type PoolRow } from "@/server/pool";

export type SortKey = "peak" | "rank_3v3" | "rank_2v2" | "joined";

const SORT_LABEL: Record<SortKey, string> = {
  peak: "Peak rank",
  rank_3v3: "3v3 rank",
  rank_2v2: "2v2 rank",
  joined: "Recently joined",
};

type RoleFilter = "everyone" | "captains" | "players";

const ROLE_OPTIONS: { key: RoleFilter; label: string }[] = [
  { key: "everyone", label: "Everyone" },
  { key: "captains", label: "Captains" },
  { key: "players", label: "Players" },
];

export function PoolBoard({
  initialRows,
  initialSort,
  initialQuery,
  initialRole,
}: {
  initialRows: PoolRow[];
  initialSort: SortKey;
  initialQuery: string;
  initialRole: RoleFilter;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [role, setRole] = useState<RoleFilter>(initialRole);
  const [search, setSearch] = useState<string>(initialQuery);
  const deferredSearch = useDeferredValue(search);

  const { data: rows = initialRows } = useQuery<PoolRow[]>({
    queryKey: ["player-pool", "full"],
    initialData: initialRows,
    queryFn: () => getFullPool(),
  });

  // EFFECT JUSTIFICATION: Supabase Realtime requires a long-lived channel
  // subscription tied to the component's lifetime. We invalidate the
  // TanStack Query cache on every change so the board re-renders. No
  // alternative escapes the useEffect carve-out here.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("public:profiles:pool")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["player-pool"] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return rows.filter((p) => {
      if (role === "captains" && !p.is_captain) return false;
      if (role === "players" && p.is_captain) return false;
      if (!q) return true;
      const name = (p.discord_global_name ?? "").toLowerCase();
      const handle = (p.discord_username ?? "").toLowerCase();
      return name.includes(q) || handle.includes(q);
    });
  }, [rows, deferredSearch, role]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sort === "joined") {
        return (
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
        );
      }
      const key =
        sort === "rank_3v3"
          ? "rank_3v3"
          : sort === "rank_2v2"
            ? "rank_2v2"
            : "peak_rank";
      return rankWeight(b[key]) - rankWeight(a[key]);
    });
  }, [filtered, sort]);

  const totalInPool = rows.length;
  const captainCount = rows.filter((p) => p.is_captain).length;
  const isFiltering =
    role !== "everyone" || deferredSearch.trim().length > 0;

  // EFFECT JUSTIFICATION: URL sync so /pool?sort=…&q=…&role=… is shareable.
  // navigate is not a reactive value; we observe debounced state and write.
  useEffect(() => {
    const params: Record<string, string> = {};
    if (sort !== "peak") params.sort = sort;
    if (role !== "everyone") params.role = role;
    const trimmed = deferredSearch.trim();
    if (trimmed) params.q = trimmed;
    navigate({ to: "/pool", search: params, replace: true });
  }, [sort, role, deferredSearch, navigate]);

  const resetFilters = () => {
    setSearch("");
    setRole("everyone");
  };

  return (
    <>
      <section className="mx-auto max-w-[1320px] px-6 pb-8 md:px-10">
        <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm md:p-5 dark:border-neutral-800 dark:bg-neutral-950/80">
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3 border-b border-neutral-200/70 pb-4 dark:border-neutral-800/70">
            <Stat label="In pool" value={totalInPool} />
            <Stat label="Captains" value={captainCount} />
            <Stat
              label={isFiltering ? "Showing" : "Sort"}
              value={isFiltering ? sorted.length : SORT_LABEL[sort]}
            />
            <Stat
              label="Live"
              value="●"
              valueClass="text-thl-orange animate-pulse"
            />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
            <label className="relative block">
              <span className="sr-only">Search by player name</span>
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or handle…"
                className="w-full rounded-lg border border-neutral-300 bg-white py-2 pr-9 pl-9 text-sm font-medium text-neutral-900 outline-none placeholder:font-normal placeholder:text-neutral-400 focus:border-thl-orange focus:ring-2 focus:ring-thl-orange/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                >
                  ×
                </button>
              )}
            </label>

            <div
              role="tablist"
              aria-label="Role filter"
              className="inline-flex shrink-0 rounded-lg border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900"
            >
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  role="tab"
                  aria-selected={role === opt.key}
                  onClick={() => setRole(opt.key)}
                  className={
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition " +
                    (role === opt.key
                      ? "bg-thl-orange text-black"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white")
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase">
                Sort
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 w-[170px] rounded-md border border-neutral-300 bg-white px-2 text-sm font-medium text-neutral-900 outline-none focus:border-thl-orange focus:ring-2 focus:ring-thl-orange/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABEL[k]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isFiltering && (
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-neutral-500">
              <span>
                Showing{" "}
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {sorted.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {totalInPool}
                </span>{" "}
                player{totalInPool === 1 ? "" : "s"}.
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="font-semibold text-thl-orange underline-offset-4 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-6 pb-24 md:px-10">
        {sorted.length === 0 ? (
          isFiltering ? (
            <NoMatchesState onReset={resetFilters} />
          ) : (
            <EmptyState />
          )
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((p) => (
              <PoolCard key={p.id} row={p} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
        {label}
      </div>
      <div className={"mt-0.5 text-xl font-bold " + (valueClass ?? "")}>
        {value}
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function PoolCard({ row }: { row: PoolRow }) {
  const name = row.discord_global_name ?? row.discord_username ?? "Unnamed";
  const initials = name.slice(0, 2).toUpperCase();
  const avatarUrl = row.profile_avatar_url ?? row.discord_avatar_url;
  const peakIcon = rankIconSrc(row.peak_rank);
  return (
    <li className="group rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-thl-orange">
      <div className="flex items-start gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-12 w-12 rounded-full border border-neutral-200 dark:border-neutral-800"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thl-orange font-bold text-black">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {row.discord_username ? (
              <Link
                to="/players/$username"
                params={{ username: row.discord_username }}
                className="truncate font-bold hover:text-thl-orange"
              >
                {name}
              </Link>
            ) : (
              <span className="truncate font-bold">{name}</span>
            )}
            {row.is_captain && (
              <span className="rounded-md bg-thl-orange/15 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.16em] text-thl-orange uppercase">
                Captain
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            @{row.discord_username ?? "—"}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase">
            <RankCell label="2v2" value={row.rank_2v2} />
            <RankCell label="3v3" value={row.rank_3v3} />
            <RankCell label="Peak" value={row.peak_rank} icon={peakIcon} highlight />
          </div>
        </div>
      </div>
    </li>
  );
}

function RankCell({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string | null;
  icon?: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "rounded-md border border-neutral-200 px-1.5 py-1 dark:border-neutral-800 " +
        (highlight ? "bg-thl-orange/5" : "")
      }
    >
      <div>{label}</div>
      <div className="mt-1 inline-flex items-center justify-center gap-1 normal-case tracking-normal">
        {icon && <img src={icon} alt="" className="h-3.5 w-3.5" />}
        <span
          className={
            "text-xs font-semibold " +
            (highlight ? "text-thl-orange" : "text-neutral-900 dark:text-white")
          }
        >
          {value ?? "—"}
        </span>
      </div>
    </div>
  );
}

function NoMatchesState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center dark:border-neutral-800 dark:bg-neutral-950">
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        No matches
      </div>
      <div className="mt-2 font-marker text-2xl md:text-3xl">
        Nobody fits those filters.
      </div>
      <p className="mt-3 text-sm text-neutral-500">
        Try a shorter name or change the role chip.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-thl-orange px-4 py-2 text-sm font-bold text-black hover:bg-thl-orange-deep"
      >
        Clear filters
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center dark:border-neutral-800 dark:bg-neutral-950">
      <div className="font-marker text-3xl md:text-4xl">
        Nobody&apos;s in the pool yet.
      </div>
      <p className="mt-3 text-sm text-neutral-500">
        Be the first sign-up.
      </p>
      <Link
        to="/signin"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-thl-orange px-4 py-2 text-sm font-bold text-black hover:bg-thl-orange-deep"
      >
        Sign in with Discord
      </Link>
    </div>
  );
}
