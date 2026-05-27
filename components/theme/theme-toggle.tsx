"use client";

import { useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons/brand";
import { THEME_COOKIE, type ThemePref } from "@/lib/site";

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * 36-px circular icon button that flips the theme cookie + applies the
 * `.dark` class to <html>. Matches the dimensions of the site search +
 * avatar buttons so the header utility group reads as a clean row of
 * three same-sized circles.
 */
export function ThemeToggle({ theme }: { theme: ThemePref }) {
  const [currentTheme, setCurrentTheme] = useState<ThemePref>(theme);
  const isDark = currentTheme === "dark";

  function toggleTheme() {
    const next: ThemePref = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    document.cookie = `${THEME_COOKIE}=${next}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
    setCurrentTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 transition hover:text-thl-orange dark:bg-neutral-800 dark:text-neutral-200 dark:hover:text-thl-orange"
    >
      {isDark ? (
        <MoonIcon className="h-[18px] w-[18px]" />
      ) : (
        <SunIcon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
