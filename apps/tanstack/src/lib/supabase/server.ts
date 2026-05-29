import { createServerClient } from "@supabase/ssr";
import {
  getRequestHeader,
  setResponseHeader,
} from "@tanstack/react-start/server";
import { env } from "@/lib/env";
import {
  parseCookieHeader,
  serializeCookie,
  type CookieOptions,
} from "@/lib/cookie";
import type { Database } from "./types";

export function createSupabaseServerClient() {
  return createServerClient<Database>(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(getRequestHeader("cookie"));
      },
      setAll(cookiesToSet) {
        const headers = cookiesToSet.map(({ name, value, options }) =>
          serializeCookie(name, value, options as CookieOptions),
        );
        setResponseHeader("set-cookie", headers);
      },
    },
  });
}
