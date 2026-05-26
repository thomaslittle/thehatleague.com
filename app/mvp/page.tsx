import Link from "next/link";
import Image from "next/image";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { ArrowRight, DiscordIcon } from "@/components/icons/brand";
import { SITE } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { POOL_SELECT, type PoolRow } from "@/lib/data/pool";
import { rankWeight } from "@/lib/data/rank-sort";
import { RankBadge } from "@/components/ranks/rank-badge";

export const metadata = {
  title: "Season MVP",
  description:
    "End-of-season MVP voting for The Hat League Season 4. One player, one vote — voting opens after Conference Finals.",
};

export default async function MvpPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select(POOL_SELECT)
    .eq("in_player_pool", true);
  const pool = (data ?? []) as PoolRow[];

  // For the placeholder lineup we surface a "form chart" — the top of the
  // pool by peak rank. Once Season 4 wraps and real stats exist, this swaps
  // to a stat-driven shortlist + a vote-cast form.
  const shortlist = [...pool]
    .sort((a, b) => rankWeight(b.peak_rank) - rankWeight(a.peak_rank))
    .slice(0, 12);

  return (
    <PageShell>
      <PageHero
        eyebrow="MVP · Season 04"
        title="Crown the dad"
        accent="who carried it."
        subtitle={
          <>
            One signed-up player, one vote. Voting opens for{" "}
            <span className="font-semibold text-thl-orange">48 hours</span>{" "}
            after Conference Finals wrap. The MVP gets the engraved hat at
            the Grand Finals stream.
          </>
        }
        actions={
          <a
            href={SITE.discordInvite}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3.5 font-bold text-white transition hover:bg-[#4752c4]"
          >
            <DiscordIcon className="h-5 w-5" />
            Drop nominations in #general
            <ArrowRight className="h-4 w-4" />
          </a>
        }
      />

      <section className="mx-auto max-w-[1320px] px-6 pb-12 md:px-10 md:pb-20">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-thl-orange/30 bg-thl-orange/10 px-6 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 items-center justify-center">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-thl-orange" />
            </span>
            <div>
              <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                Voting status
              </div>
              <div className="text-base font-bold">
                Locked — opens after Conference Finals (date TBA)
              </div>
            </div>
          </div>
          <Link
            href="/the-draft"
            className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-thl-orange underline-offset-4 hover:underline"
          >
            See the draft plan <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-6 pb-20 md:px-10 md:pb-28">
        <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Form chart · pre-season
            </div>
            <h2 className="mt-2 text-3xl leading-tight font-bold tracking-tight md:text-4xl">
              Candidates to watch.
            </h2>
            <p className="mt-2 max-w-xl text-neutral-600 dark:text-neutral-400">
              Pulled from the current player pool by peak rank. Once Season
              04 starts, this list refreshes based on per-match stats from
              ballchasing.com.
            </p>
          </div>
          <Link
            href="/pool"
            className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-thl-orange underline-offset-4 hover:underline"
          >
            See the full pool <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {shortlist.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-950">
            <div className="font-marker text-2xl md:text-3xl">
              No one&apos;s in the pool yet.
            </div>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              Once captains start drafting, the field of MVP candidates fills
              in automatically.
            </p>
            <Link
              href="/signin"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3 font-bold text-black transition hover:bg-thl-orange-deep"
            >
              Hat in the ring
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shortlist.map((p, idx) => {
              const name =
                p.discord_global_name ?? p.discord_username ?? "Unnamed";
              const initials = name.slice(0, 2).toUpperCase();
              const profileHref = p.discord_username
                ? `/players/${encodeURIComponent(p.discord_username)}`
                : null;
              return (
                <li
                  key={p.id}
                  className="group rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-xs font-extrabold tabular-nums text-neutral-500 dark:bg-neutral-900">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    {p.discord_avatar_url ? (
                      <Image
                        src={p.discord_avatar_url}
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
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950">
        <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-20">
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 md:p-12 dark:border-neutral-800 dark:bg-black">
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Reserved · ballot
            </div>
            <h3 className="mt-3 font-marker text-3xl md:text-4xl">
              The vote-cast form drops here.
            </h3>
            <p className="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
              When voting opens, every signed-up player gets one ballot
              right here. We&apos;ll show a live tally during the voting
              window and lock in the winner at close.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/the-draft"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-200"
              >
                Draft plan
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/rules"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-200"
              >
                Season rules
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
