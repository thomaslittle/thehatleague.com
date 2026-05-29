import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

declare const __SUPABASE_URL__: string;
declare const __SUPABASE_PUB_KEY__: string;

let _client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function getSupabaseBrowserClient() {
  if (!_client) {
    _client = createBrowserClient<Database>(
      __SUPABASE_URL__,
      __SUPABASE_PUB_KEY__,
    );
  }
  return _client;
}
