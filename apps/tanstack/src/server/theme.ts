import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { parseCookieHeader } from "@/lib/cookie";

export type ThemePref = "light" | "dark";

export const THEME_COOKIE = "thl-theme";

export const readTheme = createServerFn({ method: "GET" }).handler(
  (): ThemePref => {
    const cookies = parseCookieHeader(getRequestHeader("cookie"));
    const v = cookies.find((c) => c.name === THEME_COOKIE)?.value;
    return v === "light" ? "light" : "dark";
  },
);
