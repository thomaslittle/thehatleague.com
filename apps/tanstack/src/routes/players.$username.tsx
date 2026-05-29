import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, DiscordIcon } from "@/components/icons";
import { CopyLinkButton } from "@/components/copy-link-button";
import { SiteFooter } from "@/components/site-footer";
import { ogMeta } from "@/lib/og";
import { rankIconSrc } from "@/lib/ranks";
import { parseSocialLinks, SOCIAL_LINKS } from "@/lib/customization";
import { getPlayerByUsername, type PlayerProfile } from "@/server/pool";

const DISCORD_INVITE = "https://discord.gg/6KAYkCkzJH";

export const Route = createFileRoute("/players/$username")({
  loader: async ({ params }) => {
    const player = await getPlayerByUsername({
      data: { username: decodeURIComponent(params.username) },
    });
    if (!player) throw notFound();
    return { player };
  },
  notFoundComponent: NotFoundComponent,
  component: PlayerProfilePage,
  head: ({ params, loaderData }) => {
    const fallback = decodeURIComponent(params.username);
    const player = loaderData?.player;
    if (!player) {
      return {
        meta: [
          { title: `${fallback} · Player profile · The Hat League` },
        ],
      };
    }
    const name =
      player.discord_global_name ?? player.discord_username ?? fallback;
    const role = player.is_admin
      ? "League ops"
      : player.is_captain
        ? "Captain · Season 04"
        : "Season 04 player";
    const peak = player.peak_rank
      ? `Peak ${player.peak_rank}${player.peak_rank_playlist ? ` · ${player.peak_rank_playlist}` : ""}`
      : "Player profile";
    return {
      meta: ogMeta({
        title: `${name} · The Hat League`,
        description: `${name}'s Season 4 Hat League profile — ${peak.toLowerCase()}.`,
        eyebrow: role,
        subtitle: peak,
        dynamic: true,
      }),
    };
  },
});

function PlayerProfilePage() {
  const { player } = Route.useLoaderData();
  const name =
    player.discord_global_name ?? player.discord_username ?? "Unnamed";
  const avatarUrl = player.profile_avatar_url ?? player.discord_avatar_url;
  const bannerUrl = player.profile_banner_url;
  const socialLinks = parseSocialLinks(player.social_links);
  const visibleSocials = SOCIAL_LINKS.filter((link) => socialLinks[link.key]);
  const joined = player.created_at ? new Date(player.created_at) : null;
  const ranksUpdated = player.ranks_updated_at
    ? new Date(player.ranks_updated_at)
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="relative flex-1">
        {bannerUrl && <PlayerProfileBackdrop src={bannerUrl} />}
        <section className="relative z-10">
          <div className="relative mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/pool"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-thl-orange underline-offset-4 hover:underline"
              >
                ← Back to player pool
              </Link>
              {player.discord_username && (
                <CopyLinkButton
                  path={`/players/${encodeURIComponent(player.discord_username)}`}
                  label="Copy link"
                />
              )}
            </div>

            <div className="mt-8 grid items-start gap-6 md:grid-cols-[auto_1fr]">
              <div className="relative w-fit">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className={
                      "h-28 w-28 rounded-full shadow-xl md:h-32 md:w-32 " +
                      (player.is_admin
                        ? "border-2 border-thl-orange"
                        : "border-2 border-thl-orange/40")
                    }
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-thl-orange text-3xl font-extrabold text-black md:h-32 md:w-32">
                    {(player.discord_username ?? "??").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-[0.22em] uppercase">
                  <span className="text-thl-orange">
                    Player profile · Season 04
                  </span>
                  {player.is_captain && (
                    <span className="rounded-md bg-thl-orange/15 px-1.5 py-0.5 text-thl-orange">
                      Captain
                    </span>
                  )}
                  {player.is_captain_applicant && !player.is_captain && (
                    <span className="rounded-md border border-thl-orange/40 px-1.5 py-0.5 text-thl-orange">
                      Captain applicant
                    </span>
                  )}
                  {player.is_admin && (
                    <span className="rounded-md bg-thl-orange/20 px-1.5 py-0.5 text-thl-orange">
                      League ops
                    </span>
                  )}
                  {player.is_developer && (
                    <span className="rounded-md border border-neutral-400 px-1.5 py-0.5 text-neutral-600 dark:text-neutral-300">
                      Dev
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-4xl leading-[1.02] font-bold tracking-[-0.04em] md:text-6xl">
                  {name}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                  {player.discord_username && (
                    <span className="font-mono text-neutral-700 dark:text-neutral-300">
                      @{player.discord_username}
                    </span>
                  )}
                  {player.in_player_pool ? (
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold tracking-[0.18em] text-emerald-600 uppercase dark:text-emerald-400">
                      In pool
                    </span>
                  ) : (
                    <span className="rounded-md bg-neutral-200 px-2 py-0.5 text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase dark:bg-neutral-800">
                      Sitting out
                    </span>
                  )}
                </div>
                {player.is_admin && (
                  <p className="mt-3 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
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
                    {joined?.toLocaleDateString() ?? "—"}
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
                    href={DISCORD_INVITE}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-800"
                  >
                    <span className="inline-flex items-center gap-2">
                      <DiscordIcon className="h-4 w-4" /> DM on the THL
                      Discord
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
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function RankCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: PlayerProfile["rank_2v2"];
  highlight?: boolean;
}) {
  const icon = rankIconSrc(value);
  return (
    <div
      className={
        "flex items-center gap-3 p-5 " +
        (highlight ? "bg-thl-orange/5" : "bg-white dark:bg-neutral-950")
      }
    >
      {icon ? (
        <img src={icon} alt="" className="h-10 w-10" />
      ) : (
        <div className="h-10 w-10 rounded-md bg-neutral-100 dark:bg-neutral-900" />
      )}
      <div className="min-w-0">
        <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
          {label}
        </div>
        <div
          className={
            "font-marker text-2xl leading-tight md:text-3xl " +
            (highlight ? "text-thl-orange" : "text-neutral-900 dark:text-white")
          }
        >
          {value ?? "—"}
        </div>
      </div>
    </div>
  );
}

function PlayerProfileBackdrop({ src }: { src: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[720px] overflow-hidden"
    >
      <div className="absolute inset-0 bg-white dark:bg-black" />
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-45 dark:opacity-50"
        style={{ objectPosition: "center" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/88 via-white/58 to-white/20 dark:from-black/82 dark:via-black/48 dark:to-black/18" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-white dark:to-black" />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 18% 10%, rgba(247,97,3,0.28), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,1), transparent 90%)",
        }}
      />
    </div>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="text-center">
          <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
            Player not found
          </div>
          <h1 className="mt-4 font-marker text-5xl">
            Hat&apos;s out of the ring.
          </h1>
          <p className="mt-4 max-w-md text-neutral-600 dark:text-neutral-400">
            No profile matches that username yet. They may not have signed
            in via Discord, or the handle changed.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/pool"
              className="inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3 font-bold text-black transition hover:bg-thl-orange-deep"
            >
              See the full pool <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-xl border border-[#5865F2]/40 px-5 py-3 font-semibold text-[#5865F2] transition hover:bg-[#5865F2]/10"
            >
              <DiscordIcon className="h-5 w-5" />
              Find them on Discord
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
