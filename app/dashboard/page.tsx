import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { readThemePref } from "@/lib/theme";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  DiscordIcon,
  ShieldGlyph,
  TwitchIcon,
} from "@/components/icons/brand";
import { signOut } from "@/app/actions/auth";
import { SITE } from "@/lib/site";
import { getRecentAnnouncements } from "@/lib/data/announcements";
import { CopyLinkButton } from "@/components/share/copy-link-button";
import { env } from "@/lib/env";
import { rankWeight } from "@/lib/data/rank-sort";
import { RankBadge } from "@/components/ranks/rank-badge";
import { getTwitchLive } from "@/lib/twitch/live";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const theme = await readThemePref();
  const sp = await props.searchParams;
  const justOnboarded = sp.welcome === "1";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?redirect=/dashboard");

  const [{ data: profile }, announcements, { data: poolByPeak }, twitch] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      getRecentAnnouncements(3),
      supabase
        .from("profiles")
        .select("id, peak_rank")
        .eq("in_player_pool", true),
      getTwitchLive(),
    ]);
  if (!profile) redirect("/onboarding");
  const headline = announcements[0]
    ? { slug: announcements[0].slug, title: announcements[0].title }
    : null;

  const onboarded = Boolean(
    profile.rl_tracker_url &&
      profile.rank_2v2 &&
      profile.rank_3v3 &&
      profile.peak_rank,
  );
  const isPending = sp.pending === "1" || !onboarded;

  // Compute pool position by peak rank (only meaningful once the user has a
  // peak set). Ties broken by id so the position is stable.
  const ranked = (poolByPeak ?? [])
    .map((p) => ({ id: p.id, w: rankWeight(p.peak_rank) }))
    .sort((a, b) => b.w - a.w || a.id.localeCompare(b.id));
  const poolTotal = ranked.length;
  const poolPosition =
    profile.peak_rank
      ? ranked.findIndex((r) => r.id === profile.id) + 1
      : 0;

  const displayName =
    profile.discord_global_name ??
    profile.discord_username ??
    user.email ??
    "Hat dad";
  const firstName = displayName.split(/[\s_]/)[0] ?? displayName;

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-black dark:text-white">
      <SiteHeader
        theme={theme}
        showSignup={false}
        headlineAnnouncement={headline}
        navCounts={{ "/pool": (poolByPeak ?? []).length }}
        twitchLive={twitch?.isLive ?? false}
      />
      <main id="main" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[720px] overflow-hidden"
        >
          <Image
            src="/brand/thl-fennec.png"
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-40 dark:opacity-45"
            style={{ objectPosition: "55% 30%" }}
          />
          {/* Soft horizontal scrim so headline copy stays readable, but the
              fennec hero photo is clearly visible behind the welcome card. */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/55 to-white/25 dark:from-black/80 dark:via-black/45 dark:to-black/20" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-white dark:to-black" />
        </div>
        {/* Brand-orange ambient spotlight from top-left. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 18% 10%, rgba(247,97,3,0.32), transparent 60%)",
          }}
        />
        {/* Subtle counter-glow bottom-right for depth. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 90% 0%, rgba(247,97,3,0.14), transparent 60%)",
          }}
        />
        {/* Faint diagonal grid for texture under the card. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-[0.08] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,1), transparent 90%)",
          }}
        />
        <div className="relative mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
          {profile.is_admin && (
            <Link
              href="/admin"
              className="group mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-thl-orange bg-thl-orange/10 px-5 py-4 shadow-[0_15px_50px_-20px_rgba(247,97,3,0.55)] transition hover:bg-thl-orange/15 sm:px-6 sm:py-5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-thl-orange text-black shadow-md">
                  <ShieldGlyph className="h-6 w-6" />
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
          {justOnboarded && onboarded && (
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-thl-orange/30 bg-thl-orange/10 px-5 py-4">
              <div>
                <div className="text-xs font-bold tracking-[0.22em] text-thl-orange uppercase">
                  You&apos;re in the pool
                </div>
                <div className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">
                  Captains will see your ranks tonight. We&apos;ll ping you on
                  Discord the day before the draft.
                </div>
              </div>
              <a
                href={SITE.discordInvite}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4752c4]"
              >
                <DiscordIcon className="h-4 w-4" />
                Open the Discord
              </a>
            </div>
          )}

          {isPending && (
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-400/40 bg-amber-50/70 px-5 py-4 dark:border-amber-700/40 dark:bg-amber-950/30">
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
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-lg bg-thl-orange px-4 py-2 text-sm font-bold text-black hover:bg-thl-orange-deep"
              >
                Add my ranks
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/85 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] backdrop-blur-md md:p-8 dark:border-neutral-800/80 dark:bg-black/55 dark:shadow-[0_30px_80px_-30px_rgba(247,97,3,0.25)]">
            {/* Corner marker, like a stamped ID card. */}
            <div className="pointer-events-none absolute top-5 right-6 hidden flex-col items-end text-right sm:flex">
              <div className="text-[9px] font-bold tracking-[0.28em] text-neutral-400 uppercase dark:text-neutral-600">
                Player ID
              </div>
              <div className="mt-0.5 font-marker text-2xl leading-none text-thl-orange">
                S04
              </div>
            </div>

            <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  {profile.discord_avatar_url ? (
                    <Image
                      src={profile.discord_avatar_url}
                      alt=""
                      width={104}
                      height={104}
                      unoptimized
                      className={`h-24 w-24 rounded-full shadow-xl md:h-26 md:w-26 ${
                        profile.is_admin
                          ? "border-[3px] border-thl-orange"
                          : "border-[3px] border-thl-orange/40"
                      }`}
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-thl-orange text-3xl font-extrabold text-black md:h-26 md:w-26">
                      {displayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {profile.is_captain && (
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
                    {profile.is_admin
                      ? "League ops · Season 04"
                      : profile.is_captain
                        ? "Captain · Season 04"
                        : "Season 04 player"}
                  </div>
                  <h1 className="mt-1 text-4xl leading-[1.04] font-bold tracking-[-0.02em] md:text-5xl">
                    Hey,{" "}
                    <span className="font-marker font-normal text-thl-orange">
                      {firstName}.
                    </span>
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                    <span>@{profile.discord_username ?? "—"}</span>
                    <span aria-hidden>·</span>
                    <span>
                      {profile.is_captain
                        ? "Captain"
                        : profile.in_player_pool
                          ? "In the pool"
                          : "Not in pool"}
                    </span>
                    {poolPosition > 0 && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                          #{poolPosition} of {poolTotal} by peak rank
                        </span>
                      </>
                    )}
                  </div>
                  {profile.discord_username && (
                    <div className="mt-4">
                      <CopyLinkButton
                        text={`${env.SITE_URL.replace(/\/$/, "")}/players/${profile.discord_username}`}
                        label="Share my profile"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white/70 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200"
                >
                  Settings
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white/70 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:border-rose-400 hover:text-rose-500 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200 dark:hover:border-rose-500"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>

            {/* Quick-glance stat strip. */}
            <dl className="mt-8 grid gap-3 sm:grid-cols-3">
              <QuickStat
                label="Pool position"
                value={poolPosition > 0 ? `#${poolPosition}` : "—"}
                hint={poolPosition > 0 ? `of ${poolTotal}` : "Add peak rank"}
              />
              <QuickStat
                label="Peak"
                value={profile.peak_rank ?? "—"}
                hint={profile.peak_rank_playlist ?? "Playlist TBA"}
                highlight
              />
              <QuickStat
                label="Draft"
                value="TBA"
                hint="Captains lock 48h prior"
              />
            </dl>
          </div>

          {announcements.length > 0 && (
            <section className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                  From league ops
                </div>
                <Link
                  href="/announcements"
                  className="text-xs font-semibold text-neutral-500 hover:text-thl-orange"
                >
                  All announcements →
                </Link>
              </div>
              <ul className="mt-4 grid gap-3">
                {announcements.map((a) => {
                  const date = a.published_at
                    ? new Date(a.published_at)
                    : null;
                  return (
                    <li key={a.id}>
                      <Link
                        href={`/announcements/${a.slug}`}
                        className="group block rounded-2xl border border-neutral-200 px-5 py-4 transition hover:border-thl-orange dark:border-neutral-800"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase">
                          {a.pinned && (
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
                          {a.title}
                        </h2>
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                          {a.body}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* Ranks card */}
            <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex items-start justify-between border-b border-neutral-200 px-7 py-5 dark:border-neutral-800">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                    Your ranks
                  </div>
                </div>
                <Link
                  href="/settings"
                  className="text-xs font-semibold text-neutral-500 hover:text-thl-orange"
                >
                  Edit
                </Link>
              </div>

              <CompletionMeter
                fields={[
                  ["Tracker", !!profile.rl_tracker_url],
                  ["2v2", !!profile.rank_2v2],
                  ["3v3", !!profile.rank_3v3],
                  ["Peak", !!profile.peak_rank],
                ]}
              />

              <dl className="grid gap-px bg-neutral-200 sm:grid-cols-3 dark:bg-neutral-800">
                <RankCell label="2v2 (current)" value={profile.rank_2v2 ?? "—"} />
                <RankCell label="3v3 (current)" value={profile.rank_3v3 ?? "—"} />
                <RankCell
                  label={`Peak · ${profile.peak_rank_playlist ?? "—"}`}
                  value={profile.peak_rank ?? "—"}
                  highlight
                />
              </dl>

              <div className="flex items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50/60 px-7 py-4 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50">
                <span>
                  Tracker:{" "}
                  {profile.rl_tracker_url ? (
                    <a
                      href={profile.rl_tracker_url}
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
                  {profile.ranks_updated_at
                    ? new Date(profile.ranks_updated_at).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </section>

            {/* Pool status card */}
            <section className="overflow-hidden rounded-3xl border border-thl-orange/40 bg-gradient-to-br from-white to-thl-orange-soft p-7 shadow-sm dark:border-thl-orange/30 dark:from-neutral-950 dark:to-thl-orange/10">
              <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                Season 04 draft
              </div>
              <div className="mt-2 font-marker text-3xl">Date TBA</div>
              {poolPosition > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-thl-orange/15 px-3 py-1 text-xs font-bold tracking-tight text-thl-orange">
                  Pool · #{poolPosition} of {poolTotal} by peak
                </div>
              )}
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                You&apos;re marked available for the draft. We&apos;ll
                announce the date in #announcements and DM you 48 hours
                ahead.
              </p>
              <div className="mt-6 grid gap-2">
                <a
                  href={SITE.twitchUrl}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#9146ff] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#7c2bff]"
                >
                  <TwitchIcon className="h-4 w-4" />
                  Follow on Twitch
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href={SITE.discordInvite}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#4752c4]"
                >
                  <DiscordIcon className="h-4 w-4" />
                  Open the Discord
                </a>
              </div>
            </section>
          </div>

          {/* Captain status */}
          <CaptainStatusCard
            isCaptain={profile.is_captain}
            isApplicant={profile.is_captain_applicant}
          />

          {/* Quick links */}
          <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink
              href="/the-draft"
              eyebrow="Draft"
              title="The draft format"
              desc="Captains, picks, what to expect on the night."
            />
            <QuickLink
              href="/standings"
              eyebrow="Standings"
              title="S03 standings"
              desc="Full Challonge brackets — Sombrero & Fedora."
            />
            <QuickLink
              href="/captains"
              eyebrow="Captains"
              title="Captains roster"
              desc="Who&apos;s picking. The handbook lives here too."
            />
            <QuickLink
              href="/rules"
              eyebrow="Rules"
              title="Ruleset"
              desc="Season 4 updates incoming — S3 rules archived."
            />
          </section>
        </div>
      </main>
      <SiteFooter />
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
            className={isComplete ? "text-thl-orange" : "text-neutral-700 dark:text-neutral-300"}
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
          value={value === "—" ? null : value}
          size={32}
          textClassName={`text-xl font-extrabold tracking-tight ${
            highlight ? "text-thl-orange" : "text-neutral-900 dark:text-white"
          }`}
        />
      </div>
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
      <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-thl-orange/30 bg-thl-orange/10 px-6 py-5">
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
          href="/captains"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
        >
          See all captains
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    );
  }
  if (isApplicant) {
    return (
      <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-6 py-5 dark:border-neutral-800 dark:bg-neutral-950">
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
          href="/captains#apply"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
        >
          Manage application
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    );
  }
  return (
    <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-5 dark:border-neutral-800 dark:bg-neutral-950">
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
        href="/captains#apply"
        className="inline-flex items-center gap-2 rounded-lg bg-thl-orange px-4 py-2 text-sm font-bold text-black transition hover:bg-thl-orange-deep"
      >
        Apply to captain
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}

function QuickStat({
  label,
  value,
  hint,
  highlight = false,
}: {
  label: string;
  value: string;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border px-5 py-4 transition ${
        highlight
          ? "border-thl-orange/40 bg-thl-orange/10"
          : "border-neutral-200 bg-white/70 dark:border-neutral-800 dark:bg-neutral-900/40"
      }`}
    >
      <div
        className={`text-[10px] font-bold tracking-[0.22em] uppercase ${
          highlight ? "text-thl-orange" : "text-neutral-500"
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-1.5 truncate text-xl font-extrabold tracking-tight ${
          highlight
            ? "text-thl-orange"
            : "text-neutral-900 dark:text-white"
        }`}
      >
        {value}
      </div>
      <div className="mt-0.5 truncate text-xs text-neutral-500">{hint}</div>
    </div>
  );
}

function QuickLink({
  href,
  eyebrow,
  title,
  desc,
}: {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-thl-orange hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-thl-orange"
    >
      <span className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        {eyebrow}
      </span>
      <span className="text-lg font-bold tracking-tight">{title}</span>
      <span className="text-sm text-neutral-500 dark:text-neutral-400">
        {desc}
      </span>
      <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-thl-orange opacity-0 transition group-hover:opacity-100">
        Open <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
}
