"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Drop-in real-time refresher for server-rendered pages. Subscribes to the
 * given Postgres tables and calls `router.refresh()` on any change, so RSC
 * data re-fetches without a full reload. Lightweight alternative to a bespoke
 * TanStack hook where the page is already server-rendered.
 */
export function RealtimeRefresh({
  tables,
  channel,
  /** Safety-net poll interval (ms). Realtime gives instant updates; this ensures
   *  the page still catches up if a realtime event is missed. */
  pollMs = 6000,
}: {
  tables: string[];
  channel: string;
  pollMs?: number;
}) {
  const router = useRouter();

  // EFFECT JUSTIFICATION: Supabase Realtime needs a long-lived channel bound to
  // this component's lifetime; on any change we refresh the server tree. We also
  // run a low-frequency poll so a dropped realtime event never leaves a stream
  // overlay or results page stale. No non-effect path exists for either.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    // Unique topic per instance — the singleton client returns an already-
    // subscribed channel for a repeated topic (StrictMode remount), and adding
    // listeners after `subscribe()` throws.
    let ch = supabase.channel(`${channel}:${crypto.randomUUID()}`);
    for (const table of tables) {
      ch = ch.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        router.refresh();
      });
    }
    ch.subscribe();
    const poll = setInterval(() => router.refresh(), pollMs);
    return () => {
      clearInterval(poll);
      void supabase.removeChannel(ch);
    };
  }, [router, channel, tables, pollMs]);

  return null;
}
