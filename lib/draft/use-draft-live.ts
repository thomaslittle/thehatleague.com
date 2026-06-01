"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { queryKeys } from "@/lib/query-keys";
import {
  loadDraftSnapshot,
  loadAvailablePool,
  type DraftSnapshot,
  type DraftPerson,
} from "@/lib/data/draft";

/**
 * Live draft snapshot: seeds from the SSR'd `initial`, refetches via the browser
 * client, and subscribes to Realtime so a pick lands everywhere at once. Shared
 * by the public board, control room, and overlays.
 */
export function useDraftLive(seasonId: string, initial: DraftSnapshot): DraftSnapshot {
  const queryClient = useQueryClient();

  const { data: snapshot = initial } = useQuery<DraftSnapshot>({
    queryKey: queryKeys.draft.snapshot(seasonId),
    initialData: initial,
    queryFn: () => loadDraftSnapshot(getSupabaseBrowserClient(), seasonId),
    // Poll as a safety net: Realtime gives instant updates when it's flowing,
    // but a live-streamed draft must NEVER stall on the public board / OBS if a
    // realtime event is missed, so we also refetch on a short interval.
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
  });

  // EFFECT JUSTIFICATION: Supabase Realtime needs a long-lived channel bound to
  // this component's lifetime. We invalidate the snapshot + available queries on
  // any draft_state / draft_picks change so the whole board re-renders. No
  // non-effect path exists for a subscription with cleanup.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.draft.snapshot(seasonId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.draft.available(seasonId) });
    };
    // Unique topic per subscription instance — the browser client is a
    // singleton, so a fixed topic returns an already-subscribed channel on a
    // StrictMode remount and `.on()` after `subscribe()` throws.
    const channel = supabase
      .channel(`draft:${seasonId}:${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "draft_state" }, invalidate)
      .on("postgres_changes", { event: "*", schema: "public", table: "draft_picks" }, invalidate)
      .on("postgres_changes", { event: "*", schema: "public", table: "team_members" }, invalidate)
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, seasonId]);

  return snapshot;
}

/** Live undrafted pool (best-available source) for a season. */
export function useAvailablePool(seasonId: string, initial: DraftPerson[]): DraftPerson[] {
  const { data = initial } = useQuery<DraftPerson[]>({
    queryKey: queryKeys.draft.available(seasonId),
    initialData: initial,
    queryFn: () => loadAvailablePool(getSupabaseBrowserClient(), seasonId),
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
  });
  return data;
}
