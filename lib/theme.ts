import { cookies } from "next/headers";
import { THEME_COOKIE, type ThemePref } from "./site";

export async function readThemePref(): Promise<ThemePref> {
  const store = await cookies();
  const v = store.get(THEME_COOKIE)?.value;
  return v === "light" ? "light" : "dark";
}
