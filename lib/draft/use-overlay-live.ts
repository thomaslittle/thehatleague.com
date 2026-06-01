"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { queryKeys } from "@/lib/query-keys";
import { loadOverlaySettings, type OverlaySettingsView } from "@/lib/data/overlay";

/**
 * Live overlay settings: seeds from SSR, refetches via the browser client, and
 * subscribes to `overlay_settings` Realtime so scene/toggle/text changes from
 * the control room hit OBS instantly.
 */
export function useOverlayLive(
  seasonId: string,
  initial: OverlaySettingsView,
): OverlaySettingsView {
  const queryClient = useQueryClient();

  const { data = initial } = useQuery<OverlaySettingsView | null>({
    queryKey: queryKeys.draft.overlay(seasonId),
    initialData: initial,
    queryFn: () => loadOverlaySettings(getSupabaseBrowserClient(), seasonId),
    // Safety-net poll so OBS scene/text changes still reach the stream even if a
    // realtime event is dropped.
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
  });

  // EFFECT JUSTIFICATION: Realtime channel bound to component lifetime; we
  // invalidate the overlay query on any settings change so the widget re-reads.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    // Unique topic per instance (singleton client → fixed topics collide on
    // StrictMode remount, throwing on `.on()` after `subscribe()`).
    const channel = supabase
      .channel(`overlay:${seasonId}:${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "overlay_settings" },
        () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.draft.overlay(seasonId) });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, seasonId]);

  return data ?? initial;
}
