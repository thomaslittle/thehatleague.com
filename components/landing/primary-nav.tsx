"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_PRIMARY } from "@/lib/site";

/**
 * Desktop primary nav. Client component so it can read the current path
 * and flag the active route — the link for the page you're on gets an
 * orange label + an underline marker (and aria-current for a11y).
 */
export function PrimaryNav({
  navCounts,
}: {
  navCounts?: Partial<Record<string, number>>;
}) {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 xl:flex">
      {NAV_PRIMARY.map((item) => {
        const count = navCounts?.[item.href];
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm whitespace-nowrap transition ${
              active
                ? "font-semibold text-thl-orange"
                : "font-medium text-neutral-700 hover:text-thl-orange dark:text-neutral-300 dark:hover:text-thl-orange"
            }`}
          >
            {item.label}
            {typeof count === "number" && count > 0 && (
              <span className="rounded-full bg-thl-orange/15 px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums text-thl-orange">
                {count > 99 ? "99+" : count}
              </span>
            )}
            {active && (
              <svg
                key={pathname}
                aria-hidden
                viewBox="0 0 100 7"
                preserveAspectRatio="none"
                className="thl-underline-draw pointer-events-none absolute inset-x-3 -bottom-1 h-[7px] w-[calc(100%-1.5rem)] overflow-visible text-thl-orange"
              >
                {/* A filled, left-heavy taper: blunt + thick on the left,
                    lifting to a clean point on the right like a sharpie
                    stroke. Mostly straight with a touch of organic drift. */}
                <path
                  fill="currentColor"
                  d="M1 1.7 C 32 1.1, 62 1.8, 99 3.25 C 62 3.9, 32 5.2, 1 5.1 Z"
                />
              </svg>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
