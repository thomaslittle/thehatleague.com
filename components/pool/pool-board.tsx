"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, DiscordIcon } from "@/components/icons/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { rankWeight } from "@/lib/data/rank-sort";
import { queryKeys } from "@/lib/query-keys";
import { POOL_SELECT, type PoolRow } from "@/lib/data/pool";
import { SITE } from "@/lib/site";
import { RankBadge } from "@/components/ranks/rank-badge";

export type SortKey = "peak" | "rank_3v3" | "rank_2v2" | "joined";

const SORT_LABEL: Record<SortKey, string> = {
  peak: "By peak rank",
  rank_3v3: "By 3v3",
  rank_2v2: "By 2v2",
  joined: "Recently joined",
};

export function PoolBoard({
  initialRows,
  sort,
}: {
  initialRows: PoolRow[];
  sort: SortKey;
}) {
  const queryClient = useQueryClient();

  const { data: rows = initialRows } = useQuery<PoolRow[]>({
    queryKey: queryKeys.playerPool(),
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
          queryClient.invalidateQueries({ queryKey: queryKeys.playerPool() });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
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
  }, [rows, sort]);

  const captainCount = sorted.filter((p) => p.is_captain).length;

  return (
    <>
      <section className="mx-auto max-w-[1320px] px-6 pb-10 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Stat label="Total in pool" value={sorted.length} />
            <Stat label="Captains confirmed" value={captainCount} />
            <Stat label="Sort" value={SORT_LABEL[sort]} />
            <Stat label="Live" value="●" valueClass="text-thl-orange animate-pulse" />
          </div>
          <nav className="flex flex-wrap gap-2 text-xs font-bold">
            {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
              <Link
                key={k}
                href={`/pool?sort=${k}`}
                replace
                className={`rounded-lg px-3 py-1.5 transition ${
                  sort === k
                    ? "bg-thl-orange text-black"
                    : "border border-neutral-300 text-neutral-600 hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
                }`}
              >
                {SORT_LABEL[k]}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-6 pb-24 md:px-10">
        {sorted.length === 0 ? (
          <EmptyState />
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

function PoolCard({ row }: { row: PoolRow }) {
  const name =
    row.discord_global_name ?? row.discord_username ?? "Unnamed";
  const initials = name.slice(0, 2).toUpperCase();
  const profileHref = row.discord_username
    ? `/players/${encodeURIComponent(row.discord_username)}`
    : null;
  return (
    <li className="group rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-thl-orange">
      <div className="flex items-start gap-3">
        {row.discord_avatar_url ? (
          <Image
            src={row.discord_avatar_url}
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
          textClassName={`text-xs font-bold truncate ${
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
