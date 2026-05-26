"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { THEME_COOKIE, type ThemePref } from "@/lib/site";

export async function setThemePref(next: ThemePref) {
  const store = await cookies();
  store.set(THEME_COOKIE, next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/");
}

export async function toggleThemePref() {
  const store = await cookies();
  const current = store.get(THEME_COOKIE)?.value === "light" ? "light" : "dark";
  const next: ThemePref = current === "dark" ? "light" : "dark";
  store.set(THEME_COOKIE, next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/");
}
