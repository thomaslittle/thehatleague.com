"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/lib/stores/ui-store";
import { CloseIcon, MenuIcon } from "@/components/icons/glyphs";
import { DiscordIcon, TwitchIcon } from "@/components/icons/brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ShieldCheck } from "lucide-react";
import {
  NAV_POOL,
  NAV_WEEKLIES,
  NAV_LEAGUE_GROUPS,
  NAV_STATS,
  NAV_ABOUT,
  NAV_LEAGUE_OPS,
  SITE,
  type NavLink,
  type ThemePref,
} from "@/lib/site";
import { cn } from "@/lib/cn";

export function MobileNavTrigger() {
  const open = useUiStore((s) => s.navOpen);
  const toggle = useUiStore((s) => s.toggleNav);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      aria-controls="thl-mobile-nav"
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange xl:hidden dark:border-neutral-700 dark:text-neutral-300"
    >
      {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
    </button>
  );
}

export function MobileNavSheet({
  theme,
  signupHref = "/signin",
  showSignup = true,
  isAuthenticated = false,
  isAdmin = false,
}: {
  theme: ThemePref;
  signupHref?: string;
  showSignup?: boolean;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
}) {
  const open = useUiStore((s) => s.navOpen);
  const setOpen = useUiStore((s) => s.setNavOpen);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();
  const close = () => setOpen(false);

  // EFFECT JUSTIFICATION: this synchronises imperative DOM concerns with
  // open/close state — body scroll lock, ESC keydown listener, and initial
  // focus into the panel. These are not derivable from render output and
  // require subscribing to / cleaning up document-level listeners. The PRD
  // permits useEffect for genuinely unavoidable side-effects.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  const groups = [
    { title: "Weeklies", links: NAV_WEEKLIES },
    ...NAV_LEAGUE_GROUPS,
    { title: "Stats", links: NAV_STATS },
    { title: "About", links: NAV_ABOUT },
  ];

  return (
    <div
      id="thl-mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      className={cn(
        // overflow-hidden clips the off-canvas panel so it can't create a
        // phantom horizontal scrollbar on mobile when closed.
        "fixed inset-0 z-50 overflow-hidden xl:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <div
        aria-hidden
        onClick={close}
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex h-full w-[84%] max-w-[320px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-neutral-950",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <Link href="/" onClick={close} className="flex items-center gap-2">
            <Image
              src="/brand/thl-logo.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-full"
            />
            <span className="font-marker text-base">The Hat League</span>
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
          {/* Player Pool — featured single link with its live count. */}
          <Link
            href={NAV_POOL.href}
            onClick={close}
            aria-current={isActive(pathname, NAV_POOL.href) ? "page" : undefined}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition",
              isActive(pathname, NAV_POOL.href)
                ? "bg-thl-orange/10 text-thl-orange"
                : "text-neutral-900 hover:bg-neutral-100 hover:text-thl-orange dark:text-white dark:hover:bg-neutral-900",
            )}
          >
            {NAV_POOL.label}
          </Link>

          {/* Content groups — two-column to stay compact. */}
          <div className="grid gap-3">
            {groups.map((group) => (
              <div key={group.title}>
                <div className="mb-1 px-1 text-[9px] font-bold tracking-[0.2em] text-thl-orange uppercase">
                  {group.title}
                </div>
                <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                  {group.links.map((item) => (
                    <NavSheetLink key={item.href} item={item} pathname={pathname} onClick={close} />
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {isAuthenticated && (
            <div className="border-t border-neutral-200 pt-3 dark:border-neutral-800">
              <div className="mb-1 px-1 text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
                You
              </div>
              <ul className="grid grid-cols-3 gap-1">
                {[
                  { href: "/messages", label: "Messages" },
                  { href: "/friends", label: "Friends" },
                  { href: "/dashboard", label: "Dashboard" },
                ].map((item) => (
                  <NavSheetLink key={item.href} item={item} pathname={pathname} onClick={close} center />
                ))}
              </ul>
            </div>
          )}

          {isAdmin && (
            <div className="rounded-xl border border-thl-orange/40 bg-thl-orange/5 p-2.5">
              <div className="mb-1 flex items-center gap-1.5 px-1 text-[9px] font-bold tracking-[0.2em] text-thl-orange uppercase">
                <ShieldCheck className="h-3 w-3" aria-hidden />
                League ops
              </div>
              <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                {NAV_LEAGUE_OPS.map((item) => (
                  <NavSheetLink key={item.href} item={item} pathname={pathname} onClick={close} />
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto grid gap-2 pt-4">
            {showSignup && (
              <Link
                href={signupHref}
                onClick={close}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-thl-orange px-4 py-2.5 text-sm font-bold text-black hover:bg-thl-orange-deep"
              >
                <DiscordIcon className="h-4 w-4" />
                Sign up with Discord
              </Link>
            )}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={SITE.discordInvite}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
              >
                <DiscordIcon className="h-4 w-4" />
                Discord
              </a>
              <a
                href={SITE.twitchUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:border-[#9146ff] hover:text-[#9146ff] dark:border-neutral-700 dark:text-neutral-300"
              >
                <TwitchIcon className="h-4 w-4" />
                Twitch
              </a>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-[10px] text-neutral-500 dark:border-neutral-800">
              <span className="font-bold tracking-[0.22em] uppercase">Theme</span>
              <ThemeToggle theme={theme} />
            </div>
          </div>
        </nav>
      </aside>
    </div>
  );
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href.split("#")[0]}/`);
}

function NavSheetLink({
  item,
  pathname,
  onClick,
  center = false,
}: {
  item: NavLink;
  pathname: string;
  onClick: () => void;
  center?: boolean;
}) {
  const active = !item.external && isActive(pathname, item.href);
  const className = cn(
    "block truncate rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition",
    center && "text-center",
    active
      ? "bg-thl-orange/10 text-thl-orange"
      : "text-neutral-700 hover:bg-neutral-100 hover:text-thl-orange dark:text-neutral-300 dark:hover:bg-neutral-900",
  );
  return (
    <li>
      {item.external ? (
        <a href={item.href} target="_blank" rel="noopener" onClick={onClick} className={className}>
          {item.label}
        </a>
      ) : (
        <Link
          href={item.href}
          onClick={onClick}
          aria-current={active ? "page" : undefined}
          className={className}
        >
          {item.label}
        </Link>
      )}
    </li>
  );
}
