"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DiscordIcon } from "@/components/icons/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { rankWeight } from "@/lib/data/rank-sort";
import { queryKeys } from "@/lib/query-keys";
import { POOL_SELECT, type PoolRow } from "@/lib/data/pool";
import { SITE } from "@/lib/site";
import { RankBadge } from "@/components/ranks/rank-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  sort: initialSort,
  query: initialQuery = "",
  role: initialRole = "everyone",
}: {
  initialRows: PoolRow[];
  sort: SortKey;
  query?: string;
  role?: RoleFilter;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Lift filter/sort state to the client so the toolbar stays
  // interactive even on the new SSR'd Suspense path. The URL is
  // updated as a side effect of state changes so links stay shareable.
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [role, setRole] = useState<RoleFilter>(initialRole);
  const [search, setSearch] = useState<string>(initialQuery);
  const deferredSearch = useDeferredValue(search);

  const { data: rows = initialRows } = useQuery<PoolRow[]>({
    queryKey: queryKeys.playerPool.full(),
    initialData: initialRows,
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("profiles")
        .select(POOL_SELECT)
        .eq("in_player_pool", true);
      if (error) throw error;
      return data ?? [];
    },
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
          // Invalidate every player-pool query so the recent-signups
          // widget on the landing page also picks up the change.
          queryClient.invalidateQueries({ queryKey: queryKeys.playerPool.all() });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Build sorted + filtered list. Search runs against display name and
  // username; the deferred value keeps typing snappy by skipping a render.
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

  // EFFECT JUSTIFICATION: keep the URL in sync with toolbar state so
  // /pool?sort=…&q=…&role=… is shareable. router.replace is not a
  // reactive value; we observe debounced state and push the new URL.
  useEffect(() => {
    const params = new URLSearchParams();
    if (sort !== "peak") params.set("sort", sort);
    if (role !== "everyone") params.set("role", role);
    const trimmed = deferredSearch.trim();
    if (trimmed) params.set("q", trimmed);
    const next = params.toString();
    router.replace(next ? `/pool?${next}` : "/pool", { scroll: false });
  }, [sort, role, deferredSearch, router]);

  const resetFilters = () => {
    setSearch("");
    setRole("everyone");
  };

  return (
    <>
      <section className="mx-auto max-w-[1320px] px-6 pb-8 md:px-10">
        <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm md:p-5 dark:border-neutral-800 dark:bg-neutral-950/80">
          {/* Stats strip — quick at-a-glance numbers above the controls. */}
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

          {/* Controls row — search left, role chips middle, sort dropdown right. */}
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
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                    role === opt.key
                      ? "bg-thl-orange text-black"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase">
                Sort
              </span>
              <Select
                value={sort}
                onValueChange={(v) => setSort(v as SortKey)}
              >
                <SelectTrigger className="h-9 w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {SORT_LABEL[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

function PoolCard({ row }: { row: PoolRow }) {
  const name =
    row.discord_global_name ?? row.discord_username ?? "Unnamed";
  const initials = name.slice(0, 2).toUpperCase();
  const profileHref = row.discord_username
    ? `/players/${encodeURIComponent(row.discord_username)}`
    : null;
  const avatarUrl = row.profile_avatar_url ?? row.discord_avatar_url;
  return (
    <li className="group rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-thl-orange">
      <div className="flex items-start gap-3">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={48}
            height={48}
            unoptimized
            className="h-12 w-12 rounded-full border border-neutral-200 dark:border-neutral-800"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thl-orange font-bold text-black">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-base font-bold">{name}</div>
            {row.is_captain && (
              <span className="rounded-md bg-thl-orange/15 px-1.5 py-0.5 text-[10px] font-bold tracking-[0.16em] text-thl-orange uppercase">
                Captain
              </span>
            )}
          </div>
          <div className="truncate text-xs text-neutral-500">
            @{row.discord_username ?? "—"}
          </div>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <RankCell label="2v2" value={row.rank_2v2} />
        <RankCell label="3v3" value={row.rank_3v3} />
        <RankCell
          label={`Peak${row.peak_rank_playlist ? " · " + row.peak_rank_playlist : ""}`}
          value={row.peak_rank}
          highlight
        />
      </dl>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold">
        {profileHref && (
          <Link
            href={profileHref}
            className="text-thl-orange underline-offset-4 hover:underline"
          >
            View profile →
          </Link>
        )}
        {row.rl_tracker_url && (
          <a
            href={row.rl_tracker_url}
            target="_blank"
            rel="noopener"
            className="text-neutral-500 underline-offset-4 hover:text-thl-orange hover:underline"
          >
            Tracker ↗
          </a>
        )}
      </div>
    </li>
  );
}

function Stat({
  label,
  value,
  valueClass = "text-neutral-900 dark:text-white",
}: {
  label: string;
  value: number | string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        {label}
      </div>
      <div className={`mt-0.5 font-marker text-2xl ${valueClass}`}>{value}</div>
    </div>
  );
}

function RankCell({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | null | undefined;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-2 py-2 ${
        highlight
          ? "border-thl-orange/40 bg-thl-orange/5"
          : "border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
      }`}
    >
      <div className="text-[9px] font-bold tracking-[0.18em] text-neutral-500 uppercase">
        {label}
      </div>
      <div className="mt-0.5" title={value ?? ""}>
        <RankBadge
          value={value}
          size={18}
          abbreviate
          textClassName={`text-xs font-bold ${
            highlight ? "text-thl-orange" : "text-neutral-900 dark:text-white"
          }`}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center md:p-14 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        Pool · 0 players
      </div>
      <h3 className="mt-3 font-marker text-3xl md:text-4xl">
        No one&apos;s in the pool yet.
      </h3>
      <p className="mx-auto mt-3 max-w-md text-neutral-600 dark:text-neutral-400">
        Be the first hat in the ring. Sign in with Discord and confirm your
        ranks — captains can start scouting today.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 rounded-xl bg-thl-orange px-4 py-2.5 font-bold text-black hover:bg-thl-orange-deep"
        >
          <DiscordIcon className="h-4 w-4" />
          Sign me up
        </Link>
        <a
          href={SITE.discordInvite}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 font-semibold text-neutral-700 hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
        >
          Visit Discord
        </a>
      </div>
    </div>
  );
}
