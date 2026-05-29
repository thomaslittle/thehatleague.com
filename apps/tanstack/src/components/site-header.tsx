import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowRight, DiscordIcon, TwitchIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteSearch } from "@/components/site-search";
import { MobileNav } from "@/components/mobile-nav";
import { getViewer } from "@/server/auth";
import type { ThemePref } from "@/server/theme";
import { getTwitchLive, type TwitchLiveInfo } from "@/server/twitch";

const TWITCH_URL = "https://www.twitch.tv/thehatleague";

const NAV = [
  { to: "/the-draft", label: "The Draft" },
  { to: "/pool", label: "Player Pool" },
  { to: "/schedule", label: "Schedule" },
  { to: "/standings", label: "Standings" },
  { to: "/clips", label: "Clips" },
] as const;

type ViewerInfo = Awaited<ReturnType<typeof getViewer>>;

export function SiteHeader({
  initialViewer,
  initialTheme,
  initialTwitch,
  headlineAnnouncement,
  navCounts,
}: {
  initialViewer?: ViewerInfo;
  initialTheme: ThemePref;
  initialTwitch: TwitchLiveInfo | null;
  headlineAnnouncement?: { slug: string; title: string } | null;
  navCounts?: Partial<Record<string, number>>;
}) {
  const { data: viewer } = useQuery<ViewerInfo>({
    queryKey: ["viewer"],
    queryFn: () => getViewer(),
    initialData: initialViewer,
    staleTime: 60_000,
  });
  const location = useLocation();
  const showSignup =
    !viewer &&
    location.pathname !== "/signin" &&
    location.pathname !== "/onboarding";
  const { data: twitch } = useQuery<TwitchLiveInfo | null>({
    queryKey: ["twitch-live"],
    queryFn: () => getTwitchLive(),
    initialData: initialTwitch,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md dark:bg-black/80">
      <div className="border-b border-neutral-200/70 bg-neutral-50/70 dark:border-neutral-900 dark:bg-neutral-950/70">
        <div className="mx-auto flex h-9 max-w-[1320px] items-center justify-between px-6 text-[11px] tracking-[0.18em] uppercase md:px-10">
          <div className="flex min-w-0 items-center gap-2.5 font-bold text-neutral-700 dark:text-neutral-300">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-thl-orange" />
            </span>
            {headlineAnnouncement ? (
              <Link
                to="/announcements/$slug"
                params={{ slug: headlineAnnouncement.slug }}
                className="truncate transition hover:text-thl-orange"
                title={headlineAnnouncement.title}
              >
                <span className="text-thl-orange">Season 04</span>
                {" · "}
                {headlineAnnouncement.title}
              </Link>
            ) : (
              <span className="whitespace-nowrap">
                Season 04 · Registration open
              </span>
            )}
          </div>
          <div className="hidden items-center gap-6 font-semibold text-neutral-500 md:flex dark:text-neutral-500">
            <span>Est. 2020</span>
            <span>·</span>
            <span>Draft · Date&nbsp;TBA</span>
          </div>
        </div>
      </div>
      <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-3 border-b border-neutral-200/80 px-4 md:h-16 md:px-6 dark:border-neutral-900/80">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/brand/thl-logo.png" alt="" className="h-8 w-8 md:h-9 md:w-9" />
          <span className="hidden font-marker text-lg leading-none md:inline">
            The Hat League
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="ml-2 hidden flex-1 items-center gap-1 lg:flex"
        >
          {NAV.map((n) => {
            const count = navCounts?.[n.to];
            return (
              <Link
                key={n.to}
                to={n.to}
                activeProps={{ className: "text-thl-orange" }}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap text-neutral-600 transition hover:text-thl-orange dark:text-neutral-300"
              >
                {n.label}
                {typeof count === "number" && count > 0 && (
                  <span className="rounded-full bg-thl-orange/15 px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums text-thl-orange">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          {twitch?.isLive ? (
            <a
              href={twitch.url}
              target="_blank"
              rel="noopener"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-rose-600 px-3 text-[10px] font-extrabold tracking-[0.16em] text-white uppercase shadow-[0_0_18px_-2px_rgba(244,63,94,0.65)]"
              title={twitch.title ?? "Live on Twitch"}
            >
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-white/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Live
              {typeof twitch.viewers === "number" && (
                <span className="ml-0.5 tabular-nums opacity-90">
                  {twitch.viewers.toLocaleString()}
                </span>
              )}
            </a>
          ) : (
            <a
              href={TWITCH_URL}
              target="_blank"
              rel="noopener"
              aria-label="Watch on Twitch"
              className="hidden h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-[#9146ff] md:inline-flex dark:hover:bg-neutral-900"
            >
              <TwitchIcon className="h-4 w-4" />
            </a>
          )}
          <SiteSearch
            viewer={{
              isAuthenticated: !!viewer,
              isAdmin: !!viewer?.isAdmin,
            }}
          />
          <ThemeToggle initial={initialTheme} />
          {viewer ? (
            <Link
              to={
                viewer.isAdmin && (viewer.pendingAdminQueue ?? 0) > 0
                  ? "/admin"
                  : "/dashboard"
              }
              className="group relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2 ring-transparent transition hover:ring-thl-orange focus-visible:ring-thl-orange"
              aria-label={
                (viewer.pendingAdminQueue ?? 0) > 0
                  ? `${viewer.displayName ?? "Open dashboard"} — ${viewer.pendingAdminQueue} pending application${viewer.pendingAdminQueue === 1 ? "" : "s"}`
                  : (viewer.displayName ?? "Open dashboard")
              }
              title={
                (viewer.pendingAdminQueue ?? 0) > 0
                  ? `${viewer.pendingAdminQueue} pending application${viewer.pendingAdminQueue === 1 ? "" : "s"} · open league ops`
                  : (viewer.displayName ?? "Dashboard")
              }
            >
              {viewer.avatarUrl ? (
                <img
                  src={viewer.avatarUrl}
                  alt=""
                  className="h-9 w-9 rounded-full"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-thl-orange text-xs font-extrabold text-black">
                  {(viewer.displayName ?? viewer.discordUsername ?? "?")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              )}
              {(viewer.pendingAdminQueue ?? 0) > 0 && (
                <span
                  aria-hidden
                  className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-thl-orange px-1 text-[10px] font-extrabold tabular-nums leading-none text-black shadow-sm dark:border-black"
                >
                  {(viewer.pendingAdminQueue ?? 0) > 9
                    ? "9+"
                    : viewer.pendingAdminQueue}
                </span>
              )}
            </Link>
          ) : (
            showSignup && (
              <Link
                to="/signin"
                className="hidden h-9 items-center gap-1.5 rounded-md bg-thl-orange px-3 text-xs font-bold text-black transition hover:bg-thl-orange-deep sm:inline-flex md:gap-2 md:text-sm"
              >
                <DiscordIcon className="h-4 w-4" />
                <span>Sign in</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )
          )}
          <MobileNav initialTheme={initialTheme} showSignup={showSignup} />
        </div>
      </div>
    </header>
  );
}
