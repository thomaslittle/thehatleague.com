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
/** A thin orange accent strip across the top of every mega-menu panel. */
function MenuAccent() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-thl-orange/0 via-thl-orange to-thl-orange/0"
    />
  );
}

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
              <div className="relative grid w-[600px] grid-cols-3 p-2.5 pt-3">
                <MenuAccent />
                {NAV_LEAGUE_GROUPS.map((group, i) => (
                  <div
                    key={group.title}
                    className={`px-2 ${i > 0 ? "border-l border-neutral-200/70 dark:border-neutral-800/70" : ""}`}
                  >
                    <div className="mb-1.5 px-3 text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
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
              <div className="relative p-2 pt-3">
                <MenuAccent />
                <ul className="relative grid w-[260px] gap-0.5">
                  {NAV_WEEKLIES.map((l) => (
                    <NavMenuLink key={l.href} link={l} active={isActive(l.href)} />
                  ))}
                </ul>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className={triggerClass(statsActive)}>
              Stats
              {statsActive && <ActiveUnderline />}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="relative p-2 pt-3">
                <MenuAccent />
                <ul className="relative grid w-[260px] gap-0.5">
                  {NAV_STATS.map((l) => (
                    <NavMenuLink key={l.href} link={l} active={isActive(l.href)} />
                  ))}
                </ul>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className={triggerClass(aboutActive)}>
              About
              {aboutActive && <ActiveUnderline />}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="relative p-2 pt-3">
                <MenuAccent />
                <ul className="relative grid w-[260px] gap-0.5">
                  {NAV_ABOUT.map((l) => (
                    <NavMenuLink key={l.href} link={l} active={!l.external && isActive(l.href)} />
                  ))}
                </ul>
              </div>
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
                <div className="relative w-[300px] p-2 pt-3">
                  <MenuAccent />
                  <div className="relative mb-1.5 flex items-center gap-1.5 px-3 pt-1 text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                    <ShieldCheck className="h-3 w-3" aria-hidden />
                    League ops
                  </div>
                  <ul className="relative grid gap-0.5">
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

/**
 * A single clean link row inside a mega-menu: label + one-line description.
 * Hover/active is a soft full-row wash with the label turning orange — no
 * icons, no accent bars. The styling stays quiet on purpose.
 */
function NavMenuLink({ link, active }: { link: NavLinkType; active: boolean }) {
  const className = [
    // `items-start` overrides the base NavigationMenuLink's `items-center`,
    // which would otherwise centre the label/description in this column layout.
    "group/row flex flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-colors",
    "hover:bg-neutral-100 dark:hover:bg-white/[0.06]",
    "data-active:bg-thl-orange/10",
  ].join(" ");
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
        <span
          className={`text-sm transition-colors group-hover/row:text-thl-orange ${
            active
              ? "font-semibold text-thl-orange"
              : "font-medium text-neutral-800 dark:text-neutral-100"
          }`}
        >
          {link.label}
        </span>
        {link.desc && (
          <span className="text-xs leading-snug text-neutral-500 dark:text-neutral-400">
            {link.desc}
          </span>
        )}
      </NavigationMenuLink>
    </li>
  );
}
