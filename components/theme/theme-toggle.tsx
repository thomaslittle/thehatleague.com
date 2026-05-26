"use client";

import { useOptimistic, useTransition } from "react";
import { MoonIcon, SunIcon } from "@/components/icons/brand";
import { toggleThemePref } from "@/app/actions/theme";
import { cn } from "@/lib/cn";
import type { ThemePref } from "@/lib/site";

export function ThemeToggle({ theme }: { theme: ThemePref }) {
  const [optimisticTheme, setOptimisticTheme] = useOptimistic<ThemePref>(theme);
  const [, startTransition] = useTransition();
  const isDark = optimisticTheme === "dark";

  return (
    <form
      action={() => {
        startTransition(() => {
          setOptimisticTheme(isDark ? "light" : "dark");
          void toggleThemePref();
        });
      }}
    >
      <button
        type="submit"
        className="group relative inline-flex h-9 w-16 items-center rounded-full bg-neutral-200 transition-colors dark:bg-neutral-800"
        aria-label="Toggle color theme"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 text-neutral-500 dark:text-neutral-400"
        >
          <SunIcon className="h-3.5 w-3.5" />
          <MoonIcon className="h-3.5 w-3.5" />
        </span>
        <span
          className={cn(
            "absolute top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-thl-orange shadow-md transition-transform dark:bg-neutral-950",
            isDark ? "translate-x-8" : "translate-x-1",
          )}
        >
          {isDark ? (
            <MoonIcon className="h-3.5 w-3.5" />
          ) : (
            <SunIcon className="h-3.5 w-3.5" />
          )}
        </span>
      </button>
    </form>
  );
}
