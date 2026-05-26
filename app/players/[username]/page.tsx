import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page/page-shell";
import { ArrowRight, DiscordIcon, ShieldGlyph } from "@/components/icons/brand";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";
import { CopyLinkButton } from "@/components/share/copy-link-button";
import { env } from "@/lib/env";
import { RankBadge } from "@/components/ranks/rank-badge";
import { ClipCard } from "@/components/landing/clips";
import { getClips } from "@/lib/discord/clips";
import { parseSocialLinks, SOCIAL_LINKS } from "@/lib/profile/customization";

export async function generateMetadata(props: PageProps<"/players/[username]">) {
  const { username } = await props.params;
  return {
    title: `${decodeURIComponent(username)} · Player profile`,
    description: `${decodeURIComponent(username)}'s Season 4 Hat League profile — ranks, peak, tracker link.`,
  };
}

export default async function PlayerProfilePage(
  props: PageProps<"/players/[username]">,
) {
  const { username } = await props.params;
  const handle = decodeURIComponent(username);

  const supabase = await createSupabaseServerClient();
  const { data: player } = await supabase
    .from("profiles")
    .select(
      "id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, profile_banner_url, bio, social_links, rank_2v2, rank_3v3, peak_rank, peak_rank_playlist, ranks_updated_at, rl_tracker_url, is_captain, is_captain_applicant, is_admin, in_player_pool, captain_pitch, created_at",
    )
    .ilike("discord_username", handle)
    .maybeSingle();

  if (!player) notFound();

  // Pull every clip and filter to the ones matched against this profile.
  // getClips() already does the bulk profile lookup; we just keep the
  // ones whose matched username is ours.
  const [{ data: { user } }, allClips] = await Promise.all([
    supabase.auth.getUser(),
    getClips(),
  ]);
  const myClips = allClips.filter(
    (c) => c.submitterProfile?.username === player.discord_username,
  );

  const name =
    player.discord_global_name ?? player.discord_username ?? "Unnamed";
  const avatarUrl = player.profile_avatar_url ?? player.discord_avatar_url;
  const socialLinks = parseSocialLinks(player.social_links);
  const visibleSocials = SOCIAL_LINKS.filter((link) => socialLinks[link.key]);
  const joined = new Date(player.created_at);
  const ranksUpdated = player.ranks_updated_at
    ? new Date(player.ranks_updated_at)
    : null;

  return (
    <PageShell>
      <section className="relative">
        <div className="relative mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/pool"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-thl-orange underline-offset-4 hover:underline"
            >
              ← Back to player pool
            </Link>
            {player.discord_username && (
              <CopyLinkButton
                text={`${env.SITE_URL.replace(/\/$/, "")}/players/${player.discord_username}`}
                label="Copy link"
              />
            )}
          </div>

          <div className="mt-8 grid items-start gap-6 md:grid-cols-[auto_1fr]">
            <div className="relative w-fit">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={120}
                  height={120}
                  unoptimized={!!player.profile_avatar_url || !!player.discord_avatar_url}
                  className={`h-28 w-28 rounded-full shadow-xl md:h-32 md:w-32 ${
                    player.is_admin
                      ? "border-2 border-thl-orange"
                      : "border-2 border-thl-orange/40"
                  }`}
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-thl-orange text-3xl font-extrabold text-black md:h-32 md:w-32">
                  {name.slice(0, 2).toUpperCase()}
                </div>
              )}
              {player.is_admin && (
                <span
                  className="absolute -right-1 -bottom-1 inline-flex items-center justify-center rounded-full border-[3px] border-white bg-thl-orange p-1.5 text-black shadow-lg dark:border-black"
                  aria-label="League operations"
                  title="League operations"
                >
                  <ShieldGlyph className="h-4 w-4" />
                </span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
                  Player · Season 04
                </span>
                {player.is_admin && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-thl-orange px-2 py-0.5 text-[10px] font-extrabold tracking-[0.16em] text-black uppercase">
                    <ShieldGlyph className="h-3 w-3" />
                    League ops
                  </span>
                )}
                {player.is_captain && (
                  <span className="rounded-md bg-thl-orange/15 px-2 py-0.5 text-[10px] font-bold tracking-[0.16em] text-thl-orange uppercase">
                    Captain
                  </span>
                )}
                {!player.is_captain && player.is_captain_applicant && (
                  <span className="rounded-md bg-neutral-200 px-2 py-0.5 text-[10px] font-bold tracking-[0.16em] text-neutral-700 uppercase dark:bg-neutral-800 dark:text-neutral-300">
                    Captain · pending
                  </span>
                )}
                {!player.in_player_pool && (
                  <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold tracking-[0.16em] text-rose-700 uppercase dark:bg-rose-950 dark:text-rose-300">
                    Not in pool
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl font-marker drop-shadow-lg" style={{textShadow: '-2px 2px 0px #f76103'}}>
                {name}
              </h1>
              <div className="mt-1 text-sm text-neutral-500">
                @{player.discord_username ?? "—"}
              </div>
              {player.is_admin && (
                <p className="mt-3 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
                  Runs league ops — point of contact for scheduling, rules
                  questions, and disputes.
                </p>
              )}
              {player.bio && (
                <p className="mt-4 max-w-2xl rounded-2xl border border-white/60 bg-white/70 p-4 text-sm leading-relaxed text-neutral-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-black/35 dark:text-neutral-200">
                  {player.bio}
                </p>
              )}
            </div>
          </div>

          {player.is_captain && player.captain_pitch && (
            <section className="mt-10 rounded-3xl border border-thl-orange/30 bg-thl-orange/5 p-7 md:p-9">
              <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                Captain&apos;s pitch
              </div>
              <blockquote className="mt-3 font-marker text-2xl leading-tight md:text-3xl">
                &ldquo;{player.captain_pitch}&rdquo;
              </blockquote>
            </section>
          )}

          <section className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-start justify-between border-b border-neutral-200 px-7 py-5 dark:border-neutral-800">
              <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                Ranks
              </div>
              <span className="rounded-md bg-thl-orange px-2.5 py-1 text-[10px] font-extrabold tracking-[0.18em] text-black">
                S04 pool
              </span>
            </div>
            <dl className="grid gap-px bg-neutral-200 sm:grid-cols-3 dark:bg-neutral-800">
              <RankCell label="2v2 (current)" value={player.rank_2v2} />
              <RankCell label="3v3 (current)" value={player.rank_3v3} />
              <RankCell
                label={`Peak${player.peak_rank_playlist ? " · " + player.peak_rank_playlist : ""}`}
                value={player.peak_rank}
                highlight
              />
            </dl>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50/60 px-7 py-4 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50">
              <span>
                In pool since{" "}
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {joined.toLocaleDateString()}
                </span>
              </span>
              <span>
                Ranks updated{" "}
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {ranksUpdated ? ranksUpdated.toLocaleDateString() : "—"}
                </span>
              </span>
            </div>
          </section>

          <aside className="mt-6 rounded-3xl border border-neutral-200 bg-white p-7 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Scout links
            </div>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {player.rl_tracker_url && (
                <li>
                  <a
                    href={player.rl_tracker_url}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-800"
                  >
                    <span>Tracker.network profile</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </li>
              )}
              <li>
                <a
                  href={SITE.discordInvite}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-800"
                >
                  <span className="inline-flex items-center gap-2">
                    <DiscordIcon className="h-4 w-4" /> DM on the THL Discord
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </li>
              {visibleSocials.map((link) => (
                <li key={link.key}>
                  <a
                    href={socialLinks[link.key] ?? "#"}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-800"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-neutral-500">
              We&apos;ll surface per-match stats here once Season 4 starts
              and ballchasing.com ingestion is live.
            </p>
          </aside>

          {myClips.length > 0 && (
            <section className="mt-12">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                    Submitted clips
                  </div>
                  <h2 className="mt-2 text-2xl leading-tight font-bold tracking-tight md:text-3xl">
                    Their highlights.
                  </h2>
                </div>
                <Link
                  href="/clips"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-thl-orange underline-offset-4 hover:underline"
                >
                  All clips <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {myClips.map((c) => (
                  <ClipCard key={c.id} clip={c} isAuthenticated={!!user} />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </PageShell>
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
      className={`bg-white px-7 py-6 dark:bg-neutral-950 ${
        highlight ? "ring-1 ring-thl-orange/20" : ""
      }`}
    >
      <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
        {label}
      </div>
      <div className="mt-2">
        <RankBadge
          value={value}
          size={32}
          textClassName={`text-xl font-extrabold tracking-tight ${
            highlight ? "text-thl-orange" : "text-neutral-900 dark:text-white"
          }`}
        />
      </div>
    </div>
  );
}
