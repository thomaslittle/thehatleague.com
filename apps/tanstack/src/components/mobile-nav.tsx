import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CloseIcon,
  DiscordIcon,
  MenuIcon,
  TwitchIcon,
} from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import type { ThemePref } from "@/server/theme";

const TWITCH_URL = "https://www.twitch.tv/thehatleague";
const DISCORD_INVITE = "https://discord.gg/6KAYkCkzJH";

const NAV: { to: NavPath; label: string }[] = [
  { to: "/the-draft", label: "The Draft" },
  { to: "/pool", label: "Player Pool" },
  { to: "/schedule", label: "Schedule" },
  { to: "/standings", label: "Standings" },
  { to: "/captains", label: "Captains" },
  { to: "/leaderboards", label: "Leaderboards" },
  { to: "/clips", label: "Clips" },
  { to: "/rules", label: "Rules" },
];

type NavPath =
  | "/the-draft"
  | "/pool"
  | "/standings"
  | "/leaderboards"
  | "/schedule"
  | "/captains"
  | "/clips"
  | "/rules";

export function MobileNav({
  initialTheme,
  showSignup,
}: {
  initialTheme: ThemePref;
  showSignup: boolean;
}) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // EFFECT JUSTIFICATION: body scroll lock + ESC keydown + initial focus
  // when the drawer opens. These are document-level imperative concerns
  // that aren't derivable from render output.
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
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="thl-mobile-nav"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange lg:hidden dark:border-neutral-700 dark:text-neutral-300"
      >
        {open ? (
          <CloseIcon className="h-5 w-5" />
        ) : (
          <MenuIcon className="h-5 w-5" />
        )}
      </button>

      <div
        id="thl-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={
          "fixed inset-0 z-50 lg:hidden " +
          (open ? "pointer-events-auto" : "pointer-events-none")
        }
      >
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className={
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity " +
            (open ? "opacity-100" : "opacity-0")
          }
        />
        <aside
          className={
            "absolute inset-y-0 right-0 flex h-full w-[88%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-neutral-950 " +
            (open ? "translate-x-0" : "translate-x-full")
          }
        >
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5"
            >
              <img
                src="/brand/thl-logo.png"
                alt=""
                className="h-9 w-9 rounded-full"
              />
              <span className="font-marker text-lg">The Hat League</span>
            </Link>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col px-5 py-6">
            <ul className="grid gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-lg font-bold text-neutral-900 transition hover:bg-neutral-100 hover:text-thl-orange dark:text-white dark:hover:bg-neutral-900"
                  >
                    {item.label}
                    <ArrowRight className="h-4 w-4 opacity-60" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto grid gap-3 pt-8">
              {showSignup && (
                <Link
                  to="/signin"
                  onClick={() => setOpen(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-thl-orange px-4 py-3 font-bold text-black hover:bg-thl-orange-deep"
                >
                  <DiscordIcon className="h-4 w-4" />
                  Sign up with Discord
                </Link>
              )}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-3 py-3 text-sm font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
                >
                  <DiscordIcon className="h-4 w-4" />
                  Discord
                </a>
                <a
                  href={TWITCH_URL}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-3 py-3 text-sm font-semibold text-neutral-700 transition hover:border-[#9146ff] hover:text-[#9146ff] dark:border-neutral-700 dark:text-neutral-300"
                >
                  <TwitchIcon className="h-4 w-4" />
                  Twitch
                </a>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-xs text-neutral-500 dark:border-neutral-800">
                <span className="font-bold tracking-[0.22em] uppercase">
                  Theme
                </span>
                <ThemeToggle initial={initialTheme} />
              </div>
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}
