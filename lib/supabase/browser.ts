"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import type { Database } from "./types";

let _client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function getSupabaseBrowserClient() {
  if (!_client) {
    _client = createBrowserClient<Database>(
      env.SUPABASE_URL,
      env.SUPABASE_PUBLISHABLE_KEY,
    );
  }
  return _client;
}
