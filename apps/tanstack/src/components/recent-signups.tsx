import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, DiscordIcon } from "@/components/icons";
import { rankIconSrc } from "@/lib/ranks";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getRecentSignups, type PoolRow } from "@/server/pool";

const DISCORD_INVITE = "https://discord.gg/6KAYkCkzJH";
const RECENT_LIMIT = 6;

export function RecentSignups({ rows: initialRows }: { rows: PoolRow[] }) {
  const queryClient = useQueryClient();
  const { data: rows = initialRows, isFetching } = useQuery<PoolRow[]>({
    queryKey: ["player-pool", "recent", RECENT_LIMIT],
    queryFn: () => getRecentSignups({ data: { limit: RECENT_LIMIT } }),
    initialData: initialRows,
    refetchOnWindowFocus: true,
  });

  // EFFECT JUSTIFICATION: Supabase Realtime channel subscription —
  // postgres_changes events arrive over a WebSocket and need to be
  // wired up imperatively and torn down on unmount. No reactive
  // alternative exists.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("public:profiles:recent")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["player-pool"],
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const shown = rows.slice(0, RECENT_LIMIT);
  if (shown.length === 0) return null;

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
                <span
                  className={
                    "h-1.5 w-1.5 rounded-full bg-thl-orange " +
                    (isFetching ? "animate-pulse" : "")
                  }
                />
                Live
              </span>
            </div>
            <h2 className="text-3xl leading-tight font-bold tracking-[-0.02em] md:text-4xl">
              Fresh hats in the lobby.
            </h2>
          </div>
          <Link
            to="/pool"
            className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-thl-orange underline-offset-4 hover:underline"
          >
            See the full pool <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <SignupCard key={p.id} row={p} />
          ))}
        </ul>

        <p className="mt-8 text-center text-sm text-neutral-500">
          New player joining shows up here within a second. Hop into{" "}
          <a
            href={DISCORD_INVITE}
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

function SignupCard({ row }: { row: PoolRow }) {
  const name = row.discord_global_name ?? row.discord_username ?? "Unnamed";
  const initials = name.slice(0, 2).toUpperCase();
  const avatarUrl = row.profile_avatar_url ?? row.discord_avatar_url;
  const joined = row.created_at ? new Date(row.created_at) : null;
  const peakIcon = rankIconSrc(row.peak_rank);

  return (
    <li className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-thl-orange">
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-11 w-11 rounded-full border border-neutral-200 dark:border-neutral-800"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-thl-orange text-sm font-bold text-black">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {row.discord_username ? (
              <Link
                to="/players/$username"
                params={{ username: row.discord_username }}
                className="truncate text-sm font-bold hover:text-thl-orange"
              >
                {name}
              </Link>
            ) : (
              <span className="truncate text-sm font-bold">{name}</span>
            )}
            {row.is_captain && (
              <span className="rounded-md bg-thl-orange/15 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.16em] text-thl-orange uppercase">
                Captain
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-neutral-500">
            {row.peak_rank ? (
              <>
                <span className="text-neutral-400">Peak</span>
                {peakIcon && (
                  <img src={peakIcon} alt="" className="h-3.5 w-3.5" />
                )}
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {row.peak_rank}
                </span>
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
}
