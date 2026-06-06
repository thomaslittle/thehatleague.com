"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import {
  NAV_POOL,
  NAV_WEEKLIES,
  NAV_LEAGUE_GROUPS,
  NAV_STATS,
  NAV_ABOUT,
  NAV_LEAGUE_OPS,
} from "@/lib/site";
import type { NavLink as NavLinkType } from "@/lib/site";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

/** Active-route underline marker (shared by the flat link + the League trigger). */
function ActiveUnderline() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 7"
      preserveAspectRatio="none"
      className="thl-underline-draw pointer-events-none absolute inset-x-3 -bottom-1 h-[7px] w-[calc(100%-1.5rem)] overflow-visible text-thl-orange"
    >
      <path fill="currentColor" d="M1 1.7 C 32 1.1, 62 1.8, 99 3.25 C 62 3.9, 32 5.2, 1 5.1 Z" />
    </svg>
  );
}

/**
 * Desktop primary nav: Player Pool stays a standalone link (with its live
 * count), and everything else lives in one "League" mega-menu — orange-titled
 * columns. Hidden below xl (the mobile sheet lists everything).
 */
export function DesktopNav({
  navCounts,
  isAdmin = false,
}: {
  navCounts?: Partial<Record<string, number>>;
  /** League-ops members get an extra admin menu. */
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href.split("#")[0]}/`);
  const leagueActive = NAV_LEAGUE_GROUPS.some((g) => g.links.some((l) => isActive(l.href)));
  const weekliesActive = NAV_WEEKLIES.some((l) => isActive(l.href));
  const statsActive = NAV_STATS.some((l) => isActive(l.href));
  const aboutActive = NAV_ABOUT.some((l) => !l.external && isActive(l.href));
  const opsActive = NAV_LEAGUE_OPS.some((l) => isActive(l.href));
  const poolCount = navCounts?.[NAV_POOL.href];
  const poolActive = isActive(NAV_POOL.href);

  const triggerClass = (active: boolean) =>
    `relative h-auto rounded-md px-3 py-2 text-sm hover:bg-transparent focus:bg-transparent data-popup-open:bg-transparent data-open:bg-transparent ${
      active
        ? "font-semibold text-thl-orange"
        : "font-medium text-neutral-700 hover:text-thl-orange dark:text-neutral-300 dark:hover:text-thl-orange"
    }`;

  return (
    <div className="hidden items-center gap-1 xl:flex">
      <Link
        href={NAV_POOL.href}
        aria-current={poolActive ? "page" : undefined}
        className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm whitespace-nowrap transition ${
          poolActive
            ? "font-semibold text-thl-orange"
            : "font-medium text-neutral-700 hover:text-thl-orange dark:text-neutral-300 dark:hover:text-thl-orange"
        }`}
      >
        {NAV_POOL.label}
        {typeof poolCount === "number" && poolCount > 0 && (
          <span className="rounded-full bg-thl-orange/15 px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums text-thl-orange">
            {poolCount > 99 ? "99+" : poolCount}
          </span>
        )}
        {poolActive && <ActiveUnderline />}
      </Link>

      <NavigationMenu className="flex-none">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={triggerClass(leagueActive)}>
              League
              {leagueActive && <ActiveUnderline />}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[480px] grid-cols-3 gap-x-6 gap-y-1 p-5">
                {NAV_LEAGUE_GROUPS.map((group) => (
                  <div key={group.title}>
                    <div className="mb-2 px-2 text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                      {group.title}
                    </div>
                    <ul className="grid gap-0.5">
                      {group.links.map((l) => (
                        <NavMenuLink key={l.href} link={l} active={isActive(l.href)} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className={triggerClass(weekliesActive)}>
              Weeklies
              {weekliesActive && <ActiveUnderline />}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[220px] gap-0.5 p-3">
                {NAV_WEEKLIES.map((l) => (
                  <NavMenuLink key={l.href} link={l} active={isActive(l.href)} />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className={triggerClass(statsActive)}>
              Stats
              {statsActive && <ActiveUnderline />}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[200px] gap-0.5 p-3">
                {NAV_STATS.map((l) => (
                  <NavMenuLink key={l.href} link={l} active={isActive(l.href)} />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className={triggerClass(aboutActive)}>
              About
              {aboutActive && <ActiveUnderline />}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[200px] gap-0.5 p-3">
                {NAV_ABOUT.map((l) => (
                  <NavMenuLink key={l.href} link={l} active={!l.external && isActive(l.href)} />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {isAdmin && (
            <NavigationMenuItem>
              {/* Admin menu — deliberately styled as an orange pill so it
                  reads as a separate, elevated tool, not a content section. */}
              <NavigationMenuTrigger
                className={`ml-1 h-auto gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                  opsActive
                    ? "border-thl-orange bg-thl-orange/15 text-thl-orange"
                    : "border-thl-orange/40 bg-thl-orange/10 text-thl-orange hover:border-thl-orange hover:bg-thl-orange/15 focus:bg-thl-orange/15 data-popup-open:bg-thl-orange/15 data-open:bg-thl-orange/15"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                League Ops
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[220px] p-3">
                  <div className="mb-2 flex items-center gap-1.5 px-2 text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                    <ShieldCheck className="h-3 w-3" aria-hidden />
                    League ops
                  </div>
                  <ul className="grid gap-0.5">
                    {NAV_LEAGUE_OPS.map((l) => (
                      <NavMenuLink key={l.href} link={l} active={isActive(l.href)} />
                    ))}
                  </ul>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

/** A single link row inside a League/Stats/About menu — handles internal vs external. */
function NavMenuLink({ link, active }: { link: NavLinkType; active: boolean }) {
  const className = `block rounded-lg px-2 py-1.5 text-sm font-medium ${
    active ? "text-thl-orange" : "text-neutral-700 dark:text-neutral-300"
  }`;
  return (
    <li>
      <NavigationMenuLink
        active={active}
        className={className}
        render={
          link.external ? (
            <a href={link.href} target="_blank" rel="noopener" />
          ) : (
            <Link href={link.href} />
          )
        }
      >
        {link.label}
      </NavigationMenuLink>
    </li>
  );
}
