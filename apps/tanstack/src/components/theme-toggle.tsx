import { useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";
import { THEME_COOKIE, type ThemePref } from "@/server/theme";

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function ThemeToggle({ initial }: { initial: ThemePref }) {
  const [theme, setTheme] = useState<ThemePref>(initial);
  const isDark = theme === "dark";

  function toggle() {
    const next: ThemePref = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    document.cookie = `${THEME_COOKIE}=${next}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
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
        className={
          "absolute top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-thl-orange shadow-md transition-transform dark:bg-neutral-950 " +
          (isDark ? "translate-x-8" : "translate-x-1")
        }
      >
        {isDark ? (
          <MoonIcon className="h-3.5 w-3.5" />
        ) : (
          <SunIcon className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  );
}
