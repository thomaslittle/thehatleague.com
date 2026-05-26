import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  ArrowRight,
  DiscordIcon,
  TwitchIcon,
} from "@/components/icons/brand";
import { MobileNavSheet, MobileNavTrigger } from "@/components/landing/mobile-nav";
import { NAV_PRIMARY, SITE } from "@/lib/site";
import type { ThemePref } from "@/lib/site";

export interface ViewerInfo {
  isAuthenticated: boolean;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
}

export function SiteHeader({
  theme,
  signupHref = "/signin",
  showSignup = true,
  utilityRight,
  headlineAnnouncement,
  navCounts,
  viewer,
  twitchLive,
}: {
  theme: ThemePref;
  signupHref?: string;
  showSignup?: boolean;
  utilityRight?: React.ReactNode;
  /** Map of nav href → small chip number (e.g. pool size). */
  navCounts?: Partial<Record<string, number>>;
  /** Optional pinned announcement to surface in the utility bar. */
  headlineAnnouncement?: { slug: string; title: string } | null;
  /** When provided, the header reflects auth state instead of showing Sign up. */
  viewer?: ViewerInfo | null;
  /** Set when Twitch reports the league channel is currently streaming. */
  twitchLive?: boolean;
}) {
  const showSignupButton = showSignup && !viewer?.isAuthenticated;
  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/85 backdrop-blur-md dark:border-neutral-900 dark:bg-black/80"
        style={{ viewTransitionName: "site-header" }}
      >
      <div className="border-b border-neutral-200/70 bg-neutral-50/70 dark:border-neutral-900 dark:bg-neutral-950/70">
        <div className="mx-auto flex h-9 max-w-[1320px] items-center justify-between px-6 text-[11px] tracking-[0.18em] uppercase md:px-10">
          <div className="flex min-w-0 items-center gap-2.5 font-bold text-neutral-700 dark:text-neutral-300">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-thl-orange" />
            </span>
            {headlineAnnouncement ? (
              <Link
                href={`/announcements/${headlineAnnouncement.slug}`}
                className="truncate transition hover:text-thl-orange"
                title={headlineAnnouncement.title}
              >
                <span className="text-thl-orange">{SITE.seasonLabel}</span>
                {" · "}
                {headlineAnnouncement.title}
              </Link>
            ) : (
              <span className="whitespace-nowrap">
                {SITE.seasonLabel} · Registration open
              </span>
            )}
          </div>
          <div className="hidden items-center gap-6 font-semibold text-neutral-500 md:flex dark:text-neutral-500">
            {utilityRight ?? (
              <>
                <span>Est. 2020</span>
                <span>·</span>
                <span>Draft · Date&nbsp;TBA</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-4 px-4 md:gap-6 md:px-10">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5 md:gap-3">
          <Image
            src="/brand/thl-logo-notext.png"
            alt=""
            width={44}
            height={44}
            priority
            className="h-10 w-10 shrink-0 rounded-full transition group-hover:rotate-6 md:h-11 md:w-11"
          />
          <div className="leading-tight">
            <div className="font-marker text-lg whitespace-nowrap text-neutral-900 md:text-xl dark:text-white">
              The Hat League
            </div>
            <div className="hidden text-[10px] font-bold tracking-[0.24em] whitespace-nowrap text-neutral-500 uppercase sm:block dark:text-neutral-500">
              Rocket League · S04
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {NAV_PRIMARY.map((item) => {
            const count = navCounts?.[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-neutral-700 transition hover:text-thl-orange dark:text-neutral-300 dark:hover:text-thl-orange"
              >
                {item.label}
                {typeof count === "number" && count > 0 && (
                  <span className="rounded-full bg-thl-orange/15 px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums text-thl-orange">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <a
            href={SITE.twitchUrl}
            target="_blank"
            rel="noopener"
            className={
              twitchLive
                ? "hidden items-center gap-2 rounded-lg bg-[#9146ff] px-3 py-2 text-sm font-bold whitespace-nowrap text-white transition hover:bg-[#7c2bff] md:inline-flex"
                : "hidden items-center gap-2 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:text-[#9146ff] md:inline-flex dark:text-neutral-300 dark:hover:text-[#a970ff]"
            }
          >
            <TwitchIcon className="h-4 w-4" />
            {twitchLive ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Live now
              </>
            ) : (
              "Watch"
            )}
          </a>
          <a
            href={SITE.discordInvite}
            target="_blank"
            rel="noopener"
            className="hidden items-center gap-2 rounded-lg border border-neutral-300 px-3.5 py-2 text-sm font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange sm:inline-flex dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-thl-orange dark:hover:text-thl-orange"
          >
            <DiscordIcon className="h-4 w-4" />
            Discord
          </a>
          {showSignupButton && (
            <Link
              href={signupHref}
              className="inline-flex items-center gap-2 rounded-lg bg-thl-orange px-4 py-2.5 text-sm font-bold whitespace-nowrap text-black transition hover:bg-thl-orange-deep"
            >
              Sign up
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {viewer?.isAuthenticated && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
              aria-label="Go to dashboard"
              title={viewer.displayName ?? "Dashboard"}
            >
              {viewer.avatarUrl ? (
                /* Discord CDN avatars are remote — Next/Image whitelist is set */
                <Image
                  src={viewer.avatarUrl}
                  alt=""
                  width={28}
                  height={28}
                  unoptimized
                  className="h-7 w-7 rounded-full"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-thl-orange text-xs font-extrabold text-black">
                  {(viewer.displayName ?? viewer.username ?? "?")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              )}
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          )}
          <div className="hidden pl-1 md:ml-1 md:flex md:border-l md:border-neutral-200 md:pl-2 dark:md:border-neutral-800">
            <ThemeToggle theme={theme} />
          </div>
          <MobileNavTrigger />
        </div>
      </div>
    </header>
      <MobileNavSheet theme={theme} signupHref={signupHref} showSignup={showSignup} />
    </>
  );
}
