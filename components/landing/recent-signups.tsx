"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, DiscordIcon } from "@/components/icons/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { queryKeys } from "@/lib/query-keys";
import { POOL_SELECT, type PoolRow } from "@/lib/data/pool";
import { SITE } from "@/lib/site";
import { RankBadge } from "@/components/ranks/rank-badge";

const RECENT_LIMIT = 6;

export function RecentSignups({ initialRows }: { initialRows: PoolRow[] }) {
  const queryClient = useQueryClient();
  const { data = initialRows } = useQuery<PoolRow[]>({
    queryKey: queryKeys.playerPool.recent(),
    initialData: initialRows,
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: rows } = await supabase
        .from("profiles")
        .select(POOL_SELECT)
        .eq("in_player_pool", true)
        .order("created_at", { ascending: false })
        .limit(RECENT_LIMIT);
      return rows ?? [];
    },
  });

  // EFFECT JUSTIFICATION: same Supabase Realtime subscription pattern as
  // the pool board. No reactive alternative — channel + invalidate.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("public:profiles:recent")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.playerPool.all() });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const rows = data.slice(0, RECENT_LIMIT);

  if (rows.length === 0) return null;

  return (
    <section className="relative border-y border-neutral-200 bg-white dark:border-neutral-900 dark:bg-black">
      <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-20">
        <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
                Latest sign-ups
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-thl-orange/10 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.18em] text-thl-orange uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-thl-orange" />
                Live
              </span>
            </div>
            <h2 className="text-3xl leading-tight font-bold tracking-[-0.02em] md:text-4xl">
              Fresh hats in the lobby.
            </h2>
          </div>
          <Link
            href="/pool"
            className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-thl-orange underline-offset-4 hover:underline"
          >
            See the full pool <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => {
            const name =
              p.discord_global_name ?? p.discord_username ?? "Unnamed";
            const initials = name.slice(0, 2).toUpperCase();
            const profileHref = p.discord_username
              ? `/players/${encodeURIComponent(p.discord_username)}`
              : null;
            const joined = p.created_at ? new Date(p.created_at) : null;
            const avatarUrl = p.profile_avatar_url ?? p.discord_avatar_url;
            return (
              <li
                key={p.id}
                className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-thl-orange"
              >
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt=""
                      width={44}
                      height={44}
                      unoptimized
                      className="h-11 w-11 rounded-full border border-neutral-200 dark:border-neutral-800"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-thl-orange text-sm font-bold text-black">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {profileHref ? (
                        <Link
                          href={profileHref}
                          className="truncate text-sm font-bold hover:text-thl-orange"
                        >
                          {name}
                        </Link>
                      ) : (
                        <span className="truncate text-sm font-bold">
                          {name}
                        </span>
                      )}
                      {p.is_captain && (
                        <span className="rounded-md bg-thl-orange/15 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.16em] text-thl-orange uppercase">
                          Captain
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-neutral-500">
                      {p.peak_rank ? (
                        <>
                          <span className="text-neutral-400">Peak</span>
                          <RankBadge
                            value={p.peak_rank}
                            size={14}
                            textClassName="text-[11px] text-neutral-700 dark:text-neutral-300 font-semibold"
                          />
                        </>
                      ) : (
                        <span>Ranks pending</span>
                      )}
                      {joined && (
                        <span>
                          · Joined{" "}
                          {joined.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 text-center text-sm text-neutral-500">
          New player joining shows up here within a second. Hop into{" "}
          <a
            href={SITE.discordInvite}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 align-middle font-semibold text-thl-orange underline-offset-4 hover:underline"
          >
            <DiscordIcon className="h-3.5 w-3.5" />
            the Discord
          </a>{" "}
          to chat with them.
        </p>
      </div>
    </section>
  );
}
