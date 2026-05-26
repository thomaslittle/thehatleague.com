import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { setPlayerAdmin, setPlayerInPool } from "@/app/actions/admin";
import { RankBadge } from "@/components/ranks/rank-badge";

export const metadata = {
  title: "Players · Admin",
};

export default async function AdminPlayersPage() {
  const actor = await requireAdmin("/admin/players");

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("profiles")
    .select(
      "id, discord_username, discord_global_name, discord_avatar_url, peak_rank, peak_rank_playlist, rank_2v2, rank_3v3, in_player_pool, is_captain, is_captain_applicant, is_admin, created_at",
    )
    .order("created_at", { ascending: false });

  const players = rows ?? [];
  const onboardedCount = players.filter(
    (p) => p.rank_2v2 && p.rank_3v3 && p.peak_rank,
  ).length;

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
      <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
        Players
      </div>
      <h1 className="mt-3 text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl">
        {players.length} total ·{" "}
        <span className="font-marker font-normal text-thl-orange">
          {onboardedCount} ranked.
        </span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
        Every profile in the system. Flip pool membership or admin role here;
        captain status lives on{" "}
        <Link
          href="/admin/captains"
          className="font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          /admin/captains
        </Link>
        .
      </p>

      {players.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-8 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
          No profiles yet.
        </p>
      ) : (
        <div className="mt-10 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <div className="hidden grid-cols-[1fr_180px_140px_120px_180px] gap-4 border-b border-neutral-200 px-5 py-3 text-[10px] font-bold tracking-[0.16em] text-neutral-500 uppercase md:grid dark:border-neutral-800">
            <span>Player</span>
            <span>Peak rank</span>
            <span>Status</span>
            <span>Pool</span>
            <span className="text-right">Admin</span>
          </div>
          <ul>
            {players.map((p) => {
              const name =
                p.discord_global_name ??
                p.discord_username ??
                "Unnamed";
              const profileHref = p.discord_username
                ? `/players/${encodeURIComponent(p.discord_username)}`
                : null;
              const isOnboarded = Boolean(
                p.rank_2v2 && p.rank_3v3 && p.peak_rank,
              );
              const isSelf = p.id === actor.id;
              return (
                <li
                  key={p.id}
                  className="grid grid-cols-1 gap-3 border-t border-neutral-100 px-5 py-4 first:border-t-0 md:grid-cols-[1fr_180px_140px_120px_180px] md:items-center md:gap-4 dark:border-neutral-900"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {p.discord_avatar_url ? (
                      <Image
                        src={p.discord_avatar_url}
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
                      <div className="truncate text-sm font-bold">
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
                      </div>
                      <div className="truncate text-xs text-neutral-500">
                        @{p.discord_username ?? "—"}
                        {isSelf && " · you"}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <RankBadge
                      value={p.peak_rank}
                      size={18}
                      textClassName="text-sm font-semibold truncate"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[10px] font-bold tracking-[0.16em] uppercase">
                    {!isOnboarded && (
                      <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        Partial
                      </span>
                    )}
                    {p.is_captain && (
                      <span className="rounded-md bg-thl-orange/15 px-1.5 py-0.5 text-thl-orange">
                        Captain
                      </span>
                    )}
                    {!p.is_captain && p.is_captain_applicant && (
                      <span className="rounded-md bg-neutral-200 px-1.5 py-0.5 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        Cap applied
                      </span>
                    )}
                  </div>

                  <form action={setPlayerInPool}>
                    <input type="hidden" name="profile_id" value={p.id} />
                    <input
                      type="hidden"
                      name="next"
                      value={p.in_player_pool ? "0" : "1"}
                    />
                    <button
                      type="submit"
                      className={
                        p.in_player_pool
                          ? "inline-flex w-full items-center justify-center rounded-md border border-thl-orange/40 bg-thl-orange/10 px-2 py-1 text-[11px] font-bold text-thl-orange hover:bg-thl-orange/15"
                          : "inline-flex w-full items-center justify-center rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-500 hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
                      }
                    >
                      {p.in_player_pool ? "✓ In pool" : "Out — invite"}
                    </button>
                  </form>

                  <form action={setPlayerAdmin} className="md:text-right">
                    <input type="hidden" name="profile_id" value={p.id} />
                    <input
                      type="hidden"
                      name="next"
                      value={p.is_admin ? "0" : "1"}
                    />
                    <button
                      type="submit"
                      disabled={isSelf && p.is_admin}
                      title={
                        isSelf && p.is_admin
                          ? "You can't demote yourself"
                          : undefined
                      }
                      className={
                        p.is_admin
                          ? "inline-flex items-center justify-center gap-1 rounded-md border border-thl-orange/40 bg-thl-orange/10 px-2 py-1 text-[11px] font-bold text-thl-orange hover:bg-thl-orange/15 disabled:cursor-not-allowed disabled:opacity-60"
                          : "inline-flex items-center justify-center gap-1 rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-500 hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
                      }
                    >
                      {p.is_admin ? "★ Admin" : "Promote to admin"}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
