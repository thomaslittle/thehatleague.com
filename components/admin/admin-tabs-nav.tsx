"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS: { href: string; label: string }[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/captains", label: "Captains" },
  { href: "/admin/league-ops", label: "League ops" },
  { href: "/admin/announcements", label: "Announcements" },
];

/**
 * Section nav for /admin/*. Renders as:
 *  - mobile (< md): a styled dropdown showing the current section, opens a
 *    floating menu with all tabs. Active tab is highlighted; selecting one
 *    closes the menu.
 *  - desktop (>= md): a horizontal row of pill tabs with an active state.
 *
 * Designed not to fall back to two-line wrapping or hidden-scrollbar
 * horizontal scroll on touch devices — a real dropdown surface that looks
 * intentional at every width.
 */
export function AdminTabsNav() {
  const pathname = usePathname();

  return <AdminTabsNavContent key={pathname} pathname={pathname} />;
}

function AdminTabsNavContent({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Active tab: longest-prefix match so /admin/players/anything still
  // highlights "Players", and /admin alone doesn't swallow the others.
  const active = [...TABS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((t) => pathname === t.href || pathname.startsWith(t.href + "/"));

  // EFFECT JUSTIFICATION: open-state cleanup that needs document-level
  // listeners (outside click + ESC). Path changes remount this keyed component,
  // so the dropdown closes without a synchronous setState effect.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Mobile dropdown — visible <md, hidden md+ */}
      <div ref={rootRef} className="relative w-full md:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls="admin-tabs-menu"
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left text-sm font-bold shadow-sm transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-thl-orange"
        >
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Section
            </span>
            <span className="truncate text-neutral-900 dark:text-white">
              {active?.label ?? "Choose"}
            </span>
          </span>
          <Chevron
            className={cn(
              "h-4 w-4 shrink-0 text-thl-orange transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <div
            id="admin-tabs-menu"
            role="menu"
            className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] dark:border-neutral-800 dark:bg-neutral-950"
          >
            {TABS.map((t) => {
              const isActive = active?.href === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 text-sm font-semibold transition last:border-b-0 dark:border-neutral-900",
                    isActive
                      ? "bg-thl-orange/10 text-thl-orange"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-thl-orange dark:text-neutral-300 dark:hover:bg-neutral-900",
                  )}
                >
                  <span>{t.label}</span>
                  {isActive && (
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-thl-orange"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop horizontal nav — hidden <md, flex md+ */}
      <nav className="hidden gap-1 text-sm md:flex">
        {TABS.map((t) => {
          const isActive = active?.href === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 font-semibold whitespace-nowrap transition",
                isActive
                  ? "bg-thl-orange/15 text-thl-orange"
                  : "text-neutral-600 hover:bg-neutral-200/70 hover:text-thl-orange dark:text-neutral-300 dark:hover:bg-neutral-800/70",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 7.5l5 5 5-5" />
    </svg>
  );
}
