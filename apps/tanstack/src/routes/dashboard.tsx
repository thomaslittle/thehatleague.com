import {
  createFileRoute,
  redirect,
  Link,
  useLoaderData,
} from "@tanstack/react-router";
import { useTransition } from "react";
import { ArrowRight, DiscordIcon, TwitchIcon } from "@/components/icons";
import { CopyLinkButton } from "@/components/copy-link-button";
import { LeagueOpsApplication } from "@/components/league-ops-application";
import { SiteFooter } from "@/components/site-footer";
import { rankIconSrc } from "@/lib/ranks";
import { getViewer, signOut } from "@/server/auth";
import { getPoolPosition } from "@/server/pool";
import {
  getRecentAnnouncements,
  type Announcement,
} from "@/server/announcements";

const DISCORD_INVITE = "https://discord.gg/6KAYkCkzJH";
const TWITCH_URL = "https://www.twitch.tv/thehatleague";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const viewer = await getViewer();
    if (!viewer) {
      throw redirect({
        to: "/signin",
        search: { redirect: "/dashboard" },
      });
    }
    return { viewer };
  },
  loader: async ({ context }) => {
    const onboarded = Boolean(
      context.viewer.trackerUrl &&
        context.viewer.rank2v2 &&
        context.viewer.rank3v3 &&
        context.viewer.peakRank,
    );
    // poolCount already fetched in __root loader; pull it from there via
    // useLoaderData in the component instead of refetching here.
    const [poolPos, announcements] = await Promise.all([
      getPoolPosition(),
      getRecentAnnouncements({ data: { limit: 3 } }),
    ]);
    return {
      viewer: context.viewer,
      poolPos,
      announcements,
      onboarded,
    };
  },
  validateSearch: (search: Record<string, unknown>) => {
    const out: { welcome?: "1"; pending?: "1" } = {};
    if (search.welcome === "1") out.welcome = "1";
    if (search.pending === "1") out.pending = "1";
    return out;
  },
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard · The Hat League" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function DashboardPage() {
  const { viewer, poolPos, announcements, onboarded } =
    Route.useLoaderData();
  const { poolCount } = useLoaderData({ from: "__root__" });
  const { welcome, pending } = Route.useSearch();
  const isPending = pending === "1" || !onboarded;
  const [signingOut, startSignOut] = useTransition();
  const firstName =
    viewer.displayName?.split(/[\s_]/)[0] ??
    viewer.discordUsername?.split(/[\s_]/)[0] ??
    "captain";

  function onSignOut() {
    startSignOut(async () => {
      await signOut();
      window.location.assign("/");
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(247,97,3,0.32), transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-[1320px] px-6 pt-16 pb-12 md:px-10 md:pt-24 md:pb-16">
            {viewer.isAdmin && (
              <Link
                to="/admin"
                className="group mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-thl-orange bg-thl-orange/10 px-5 py-4 shadow-[0_15px_50px_-20px_rgba(247,97,3,0.55)] transition hover:bg-thl-orange/15 sm:px-6 sm:py-5"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-thl-orange text-2xl text-black shadow-md">
                    ★
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                      League ops · Admin access
                    </div>
                    <div className="mt-0.5 truncate text-base font-bold text-neutral-900 sm:text-lg dark:text-white">
                      Run the league →
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                      Approve captains, post announcements, manage players,
                      preview OG cards.
                    </div>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-thl-orange px-4 py-2.5 text-sm font-extrabold whitespace-nowrap text-black transition group-hover:bg-thl-orange-deep">
                  Open ops
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            )}

            {welcome === "1" && onboarded && (
              <div className="mb-8 flex items-center gap-3 rounded-2xl border border-thl-orange/40 bg-thl-orange/10 px-5 py-4">
                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-thl-orange" />
                <p className="text-sm text-neutral-800 dark:text-neutral-200">
                  <span className="font-bold">Welcome in.</span> Ranks saved,
                  you&apos;re in the Season 04 pool. Captains can see you now.
                </p>
              </div>
            )}

            {isPending && (
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-400/40 bg-amber-50/70 px-5 py-4 dark:border-amber-700/40 dark:bg-amber-950/30">
                <div>
                  <div className="text-xs font-bold tracking-[0.22em] text-amber-700 uppercase dark:text-amber-300">
                    Ranks pending
                  </div>
                  <div className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">
                    You&apos;re in the pool but captains can&apos;t scout you
                    without ranks. Add them before draft night.
                  </div>
                </div>
                <Link
                  to="/onboarding"
                  className="inline-flex items-center gap-2 rounded-lg bg-thl-orange px-4 py-2 text-sm font-bold text-black hover:bg-thl-orange-deep"
                >
                  Add my ranks
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            <div className="relative grid items-center gap-6 md:grid-cols-[auto_1fr] md:gap-10">
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 right-0 hidden flex-col items-end text-right sm:flex"
              >
                <div className="text-[9px] font-bold tracking-[0.28em] text-neutral-400 uppercase dark:text-neutral-600">
                  Player ID
                </div>
                <div className="mt-0.5 font-marker text-2xl leading-none text-thl-orange">
                  S04
                </div>
              </div>
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute inset-0 -m-3 rounded-full opacity-60 blur-2xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(247,97,3,0.55), transparent 60%)",
                  }}
                />
                {viewer.avatarUrl ? (
                  <img
                    src={viewer.avatarUrl}
                    alt=""
                    className="relative h-24 w-24 rounded-full border-2 border-thl-orange md:h-32 md:w-32"
                  />
                ) : (
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-thl-orange bg-thl-orange/20 text-2xl font-extrabold md:h-32 md:w-32 md:text-3xl">
                    {(viewer.discordUsername ?? "??").slice(0, 2).toUpperCase()}
                  </div>
                )}
                {viewer.isCaptain && (
                  <span
                    className="absolute -right-1 -bottom-1 inline-flex h-9 items-center justify-center rounded-full border-[3px] border-white bg-thl-orange px-2.5 text-[10px] font-extrabold tracking-[0.18em] text-black uppercase shadow-lg dark:border-black"
                    title="Captain"
                  >
                    Captain
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
                  {viewer.isAdmin
                    ? "League ops · Season 04"
                    : viewer.isCaptain
                      ? "Captain · Season 04"
                      : "Dashboard · Season 04"}
                </div>
                <h1 className="mt-3 text-4xl leading-[0.95] font-bold tracking-[-0.04em] md:text-6xl">
                  Welcome back,
                  <br />
                  <span className="font-marker font-normal text-thl-orange">
                    {firstName}.
                  </span>
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                  <span>@{viewer.discordUsername ?? "—"}</span>
                  <span aria-hidden>·</span>
                  <span>
                    {viewer.isCaptain
                      ? "Captain"
                      : viewer.inPlayerPool
                        ? "In the pool"
                        : "Not in pool"}
                  </span>
                  {poolPos.position > 0 && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        #{poolPos.position} of {poolPos.total} by peak rank
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-4 text-neutral-600 md:text-lg dark:text-neutral-400">
                  You&apos;re in the Season 4 pool alongside{" "}
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {poolCount.toLocaleString()}
                  </span>{" "}
                  other hat dads. Captains are scouting now — watch the
                  Discord for the draft-date announcement.
                </p>
                {viewer.discordUsername && (
                  <div className="mt-4">
                    <CopyLinkButton
                      path={`/players/${encodeURIComponent(viewer.discordUsername)}`}
                      label="Share my profile"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-6 pb-10 md:px-10 md:pb-12">
          <dl className="grid gap-3 sm:grid-cols-3">
            <QuickStat
              label="Pool position"
              value={poolPos.position > 0 ? `#${poolPos.position}` : "—"}
              hint={
                poolPos.position > 0
                  ? `of ${poolPos.total}`
                  : "Add peak rank"
              }
            />
            <QuickStat
              label="Peak"
              value={viewer.peakRank ?? "—"}
              hint={viewer.peakPlaylist ?? "Playlist TBA"}
              highlight
            />
            <QuickStat
              label="Draft"
              value="TBA"
              hint="Captains lock 48h prior"
            />
          </dl>
        </section>

        <section className="mx-auto max-w-[1320px] px-6 pb-16 md:px-10 md:pb-20">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex items-start justify-between border-b border-neutral-200 px-7 py-5 dark:border-neutral-800">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                    Your ranks
                  </div>
                </div>
                <Link
                  to="/settings"
                  className="text-xs font-semibold text-neutral-500 hover:text-thl-orange"
                >
                  Edit
                </Link>
              </div>

              <CompletionMeter
                fields={[
                  ["Tracker", !!viewer.trackerUrl],
                  ["2v2", !!viewer.rank2v2],
                  ["3v3", !!viewer.rank3v3],
                  ["Peak", !!viewer.peakRank],
                ]}
              />

              <dl className="grid gap-px bg-neutral-200 sm:grid-cols-3 dark:bg-neutral-800">
                <RankCell
                  label="2v2 (current)"
                  value={viewer.rank2v2 ?? "—"}
                />
                <RankCell
                  label="3v3 (current)"
                  value={viewer.rank3v3 ?? "—"}
                />
                <RankCell
                  label={`Peak · ${viewer.peakPlaylist ?? "—"}`}
                  value={viewer.peakRank ?? "—"}
                  highlight
                />
              </dl>

              <div className="flex items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50/60 px-7 py-4 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50">
                <span>
                  Tracker:{" "}
                  {viewer.trackerUrl ? (
                    <a
                      href={viewer.trackerUrl}
                      target="_blank"
                      rel="noopener"
                      className="font-semibold text-thl-orange underline-offset-4 hover:underline"
                    >
                      Open profile ↗
                    </a>
                  ) : (
                    "Not linked"
                  )}
                </span>
                <span>
                  Last updated{" "}
                  {viewer.ranksUpdatedAt
                    ? new Date(viewer.ranksUpdatedAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-thl-orange/40 bg-gradient-to-br from-white to-thl-orange/10 p-7 shadow-sm dark:border-thl-orange/30 dark:from-neutral-950 dark:to-thl-orange/10">
              <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                Season 04 draft
              </div>
              <div className="mt-2 font-marker text-3xl">Date TBA</div>
              {poolPos.position > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-thl-orange/15 px-3 py-1 text-xs font-bold tracking-tight text-thl-orange">
                  Pool · #{poolPos.position} of {poolPos.total} by peak
                </div>
              )}
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                You&apos;re marked available for the draft. We&apos;ll
                announce the date in #announcements and DM you 48 hours
                ahead.
              </p>
              <div className="mt-6 grid gap-2">
                <a
                  href={TWITCH_URL}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#9146ff] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#7c2bff]"
                >
                  <TwitchIcon className="h-4 w-4" />
                  Follow on Twitch
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#4752c4]"
                >
                  <DiscordIcon className="h-4 w-4" />
                  Open the Discord
                </a>
              </div>
            </div>
          </div>
        </section>

        {announcements.length > 0 && (
          <section className="mx-auto max-w-[1320px] px-6 pb-12 md:px-10 md:pb-16">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                  From league ops
                </div>
                <Link
                  to="/announcements"
                  className="text-xs font-semibold text-neutral-500 hover:text-thl-orange"
                >
                  All announcements →
                </Link>
              </div>
              <ul className="mt-4 grid gap-3">
                {announcements.map((a) => (
                  <AnnouncementRow key={a.id} announcement={a} />
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-[1320px] px-6 pb-16 md:px-10 md:pb-20">
          <div className="grid gap-5 md:grid-cols-2">
            <StatusCard
              eyebrow="Pool status"
              title={
                viewer.inPlayerPool
                  ? "You're in the pool."
                  : "You're sitting out."
              }
              body={
                viewer.inPlayerPool
                  ? "Captains will see you when picks start. Update ranks anytime from /onboarding."
                  : "You can re-enter from the onboarding form whenever you want."
              }
              cta={{ to: "/onboarding", label: "Update ranks" }}
            />
            <StatusCard
              eyebrow="Draft"
              title="Captains pick live. Date TBA."
              body="When the date locks in, you'll get a Discord ping and a banner here. Twitch link goes live at start time."
              cta={{ to: "/the-draft", label: "Read the draft format" }}
            />
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-6 pb-10 md:px-10 md:pb-12">
          <CaptainStatusCard
            isCaptain={viewer.isCaptain}
            isApplicant={viewer.isCaptainApplicant}
          />
        </section>

        {!viewer.isAdmin && (
          <section
            id="league-ops"
            className="mx-auto max-w-[1320px] px-6 pb-16 md:px-10 md:pb-20"
          >
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="grid gap-8 p-6 md:gap-10 md:p-10 lg:grid-cols-[1fr_1.1fr] lg:p-12">
                <div>
                  <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
                    Want to join league ops?
                  </div>
                  <h2 className="mt-3 text-3xl leading-tight font-bold tracking-[-0.02em] md:text-4xl">
                    Help us{" "}
                    <span className="font-marker font-normal text-thl-orange">
                      run the league.
                    </span>
                  </h2>
                  <p className="mt-4 max-w-md text-neutral-600 dark:text-neutral-400">
                    Schedule matches, coordinate captains, manage the player
                    pool, run draft events, handle communications — if you
                    can own it, we&apos;ll give you the keys. A current admin
                    reviews and DMs you on Discord.
                  </p>
                </div>

                <LeagueOpsApplication
                  alreadyApplied={viewer.isAdminApplicant}
                  initialPitch={viewer.adminPitch ?? ""}
                />
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-[1320px] px-6 pb-16 md:px-10 md:pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink
              to="/the-draft"
              eyebrow="Draft"
              title="The draft format"
              desc="Captains, picks, what to expect on the night."
            />
            <QuickLink
              to="/standings"
              eyebrow="Standings"
              title="S03 standings"
              desc="Full Challonge brackets — Sombrero & Fedora."
            />
            <QuickLink
              to="/captains"
              eyebrow="Captains"
              title="Captains roster"
              desc="Who's picking. The handbook lives here too."
            />
            <QuickLink
              to="/rules"
              eyebrow="Rules"
              title="Ruleset"
              desc="Season 4 updates incoming — S3 rules archived."
            />
          </div>
        </section>

        <section className="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950">
          <div className="mx-auto max-w-[1320px] px-6 py-16 md:px-10 md:py-20">
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Stay close to the lobby
            </div>
            <h2 className="mt-3 text-3xl leading-tight font-bold tracking-[-0.02em] md:text-4xl">
              The Discord is where it all happens.
            </h2>
            <p className="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
              Captain DMs, scrim invites, scheduling, clips — all in the same
              place. The site mirrors what matters; the chat is where the
              moment-to-moment lives.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3 font-bold text-white transition hover:bg-[#4752c4]"
              >
                <DiscordIcon className="h-5 w-5" />
                Open the Discord
              </a>
              <a
                href={TWITCH_URL}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-xl border border-[#9146ff]/40 px-5 py-3 font-semibold text-[#9146ff] transition hover:bg-[#9146ff]/10"
              >
                <TwitchIcon className="h-5 w-5" />
                Watch on Twitch
              </a>
              <button
                type="button"
                onClick={onSignOut}
                disabled={signingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-5 py-3 font-semibold text-neutral-700 transition hover:border-rose-500 hover:text-rose-500 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-200"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
              <Link
                to="/pool"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-5 py-3 font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-200"
              >
                See who&apos;s in the pool
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-5 py-3 font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-200"
              >
                Settings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function CaptainStatusCard({
  isCaptain,
  isApplicant,
}: {
  isCaptain: boolean;
  isApplicant: boolean;
}) {
  if (isCaptain) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-thl-orange/30 bg-thl-orange/10 px-6 py-5">
        <div>
          <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            ★ Captain · Season 04
          </div>
          <div className="mt-1 text-base font-bold">
            You&apos;re picking on draft night.
          </div>
          <div className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300">
            Pre-draft DM with the pick order goes out 48 hours before.
          </div>
        </div>
        <Link
          to="/captains"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
        >
          See all captains
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }
  if (isApplicant) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-6 py-5 dark:border-neutral-800 dark:bg-neutral-950">
        <div>
          <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            Captain application · pending
          </div>
          <div className="mt-1 text-base font-bold">
            League ops will DM you on Discord.
          </div>
          <div className="mt-0.5 text-sm text-neutral-500">
            Reviews happen a couple times a week. Want out? Withdraw from
            the captains page.
          </div>
        </div>
        <Link
          to="/captains"
          hash="apply"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
        >
          Manage application
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-5 dark:border-neutral-800 dark:bg-neutral-950">
      <div>
        <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
          Want to captain?
        </div>
        <div className="mt-1 text-base font-bold">
          Tell us how you&apos;d run a lobby.
        </div>
        <div className="mt-0.5 text-sm text-neutral-500">
          Captains pick live on draft night. League ops reviews every
          application personally.
        </div>
      </div>
      <Link
        to="/captains"
        hash="apply"
        className="inline-flex items-center gap-2 rounded-lg bg-thl-orange px-4 py-2 text-sm font-bold text-black transition hover:bg-thl-orange-deep"
      >
        Apply to captain
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function AnnouncementRow({ announcement }: { announcement: Announcement }) {
  const date = announcement.published_at
    ? new Date(announcement.published_at)
    : null;
  return (
    <li>
      <Link
        to="/announcements/$slug"
        params={{ slug: announcement.slug }}
        className="group block rounded-2xl border border-neutral-200 px-5 py-4 transition hover:border-thl-orange dark:border-neutral-800"
      >
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase">
          {announcement.pinned && (
            <span className="rounded-md bg-thl-orange px-1.5 py-0.5 text-black">
              Pinned
            </span>
          )}
          <span className="text-thl-orange">
            {date?.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            }) ?? ""}
          </span>
        </div>
        <h2 className="mt-1.5 text-lg font-bold tracking-tight transition group-hover:text-thl-orange">
          {announcement.title}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {announcement.body}
        </p>
      </Link>
    </li>
  );
}

function QuickLink({
  to,
  eyebrow,
  title,
  desc,
}: {
  to: "/the-draft" | "/standings" | "/captains" | "/rules";
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950"
    >
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        {eyebrow}
      </div>
      <div className="mt-2 font-marker text-2xl transition group-hover:text-thl-orange">
        {title}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {desc}
      </p>
      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
        Open
        <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}

function QuickStat({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "rounded-2xl border p-5 " +
        (highlight
          ? "border-thl-orange/40 bg-thl-orange/5 dark:bg-thl-orange/10"
          : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950")
      }
    >
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        {label}
      </div>
      <div
        className={
          "mt-2 font-marker text-2xl md:text-3xl " +
          (highlight
            ? "text-thl-orange"
            : "text-neutral-900 dark:text-white")
        }
      >
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-xs text-neutral-500">{hint}</div>
      )}
    </div>
  );
}

function CompletionMeter({
  fields,
}: {
  fields: Array<readonly [label: string, done: boolean]>;
}) {
  const done = fields.filter(([, d]) => d).length;
  const pct = Math.round((done / fields.length) * 100);
  const isComplete = done === fields.length;

  return (
    <div className="border-b border-neutral-200 px-7 py-4 dark:border-neutral-800">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold tracking-[0.18em] text-neutral-500 uppercase">
          Profile{" "}
          <span
            className={
              isComplete
                ? "text-thl-orange"
                : "text-neutral-700 dark:text-neutral-300"
            }
          >
            {pct}% complete
          </span>
        </span>
        <span className="flex flex-wrap gap-2">
          {fields.map(([label, isDone]) => (
            <span
              key={label}
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.16em] uppercase ${
                isDone
                  ? "bg-thl-orange/15 text-thl-orange"
                  : "bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600"
              }`}
            >
              {isDone ? "✓ " : ""}
              {label}
            </span>
          ))}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-900">
        <div
          className="h-full bg-thl-orange transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function RankCell({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const icon = rankIconSrc(value === "—" ? null : value);
  return (
    <div
      className={`bg-white px-7 py-6 dark:bg-neutral-950 ${
        highlight ? "ring-1 ring-thl-orange/20" : ""
      }`}
    >
      <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
        {label}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {icon && <img src={icon} alt="" className="h-8 w-8" />}
        <span
          className={`text-xl font-extrabold tracking-tight ${
            highlight
              ? "text-thl-orange"
              : "text-neutral-900 dark:text-white"
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function StatusCard({
  eyebrow,
  title,
  body,
  cta,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: { to: "/onboarding" | "/the-draft"; label: string };
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-7 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        {eyebrow}
      </div>
      <h3 className="mt-2 font-marker text-2xl md:text-3xl">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {body}
      </p>
      <Link
        to={cta.to}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-thl-orange underline-offset-4 hover:underline"
      >
        {cta.label}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
