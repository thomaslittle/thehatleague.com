"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const ROUTE_COMPLETE_DELAY_MS = 220;
const ROUTE_FAILSAFE_MS = 10_000;

export function PageProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const routeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failsafeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeActiveRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const [routeProgress, setRouteProgress] = useState(0);
  const [routeActive, setRouteActive] = useState(false);

  useEffect(() => {
    const clearRouteTimers = () => {
      if (routeTimerRef.current) {
        clearInterval(routeTimerRef.current);
        routeTimerRef.current = null;
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      if (failsafeTimerRef.current) {
        clearTimeout(failsafeTimerRef.current);
        failsafeTimerRef.current = null;
      }
    };

    const completeRouteProgress = () => {
      if (!routeActiveRef.current) return;
      clearRouteTimers();
      setRouteProgress(100);
      hideTimerRef.current = setTimeout(() => {
        routeActiveRef.current = false;
        setRouteActive(false);
        setRouteProgress(0);
      }, ROUTE_COMPLETE_DELAY_MS);
    };

    const startRouteProgress = () => {
      clearRouteTimers();
      routeActiveRef.current = true;
      setRouteActive(true);
      setRouteProgress(8);
      routeTimerRef.current = setInterval(() => {
        setRouteProgress((current) => {
          if (current >= 92) return current;
          const remaining = 92 - current;
          return current + Math.max(1, remaining * 0.12);
        });
      }, 180);
      failsafeTimerRef.current = setTimeout(
        completeRouteProgress,
        ROUTE_FAILSAFE_MS,
      );
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (
        anchor.target ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("rel")?.includes("external")
      ) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      if (nextUrl.origin !== currentUrl.origin) return;
      if (
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search
      ) {
        return;
      }

      startRouteProgress();
    };

    window.addEventListener("pageshow", completeRouteProgress);
    window.addEventListener("popstate", startRouteProgress);
    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      clearRouteTimers();
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("popstate", startRouteProgress);
      window.removeEventListener("pageshow", completeRouteProgress);
    };
  }, []);

  useEffect(() => {
    if (!routeActiveRef.current) return;
    const completeTimer = setTimeout(() => {
      if (!routeActiveRef.current) return;
      setRouteProgress(100);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        routeActiveRef.current = false;
        setRouteActive(false);
        setRouteProgress(0);
      }, ROUTE_COMPLETE_DELAY_MS);
    }, 80);
    return () => clearTimeout(completeTimer);
  }, [pathname, search]);

  useEffect(() => {
    const updateScrollProgress = () => {
      frameRef.current = null;
      const root = document.documentElement;
      const scrollable = root.scrollHeight - root.clientHeight;
      const progress =
        scrollable > 0 ? Math.min(1, Math.max(0, root.scrollTop / scrollable)) : 0;
      if (scrollBarRef.current) {
        scrollBarRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    const scheduleUpdate = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(updateScrollProgress);
    };

    updateScrollProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [pathname, search]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70]"
    >
      <div className="h-[3px] bg-neutral-50/70 dark:bg-neutral-950/70">
        <div
          className="h-full origin-left bg-thl-orange shadow-[0_0_18px_rgba(247,97,3,0.75)] transition-[width,opacity] duration-200 ease-out"
          style={{
            width: `${routeProgress}%`,
            opacity: routeActive ? 1 : 0,
          }}
        />
      </div>
      <div className="h-[3px] bg-neutral-50/70 dark:bg-neutral-950/70">
        <div
          ref={scrollBarRef}
          className="h-full origin-left scale-x-0 bg-thl-orange shadow-[0_0_18px_rgba(247,97,3,0.75)]"
        />
      </div>
    </div>
  );
}
