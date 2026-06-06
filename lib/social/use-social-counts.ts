"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { queryKeys } from "@/lib/query-keys";

export interface SocialCounts {
  unread: number;
  requests: number;
}

async function fetchSocialCounts(): Promise<SocialCounts> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { unread: 0, requests: 0 };

  const [convsRes, readsRes, reqRes] = await Promise.all([
    supabase.from("conversations").select("id"),
    supabase.from("conversation_reads").select("conversation_id, last_read_at"),
    supabase
      .from("friendships")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .eq("addressee_id", user.id),
  ]);

  const convIds = (convsRes.data ?? []).map((c) => c.id);
  let unread = 0;
  if (convIds.length) {
    const readMap = new Map((readsRes.data ?? []).map((r) => [r.conversation_id, r.last_read_at]));
    const { data: msgs } = await supabase
      .from("messages")
      .select("conversation_id, sender_id, created_at")
      .in("conversation_id", convIds);
    for (const m of msgs ?? []) {
      const lr = readMap.get(m.conversation_id);
      if (m.sender_id !== user.id && (!lr || m.created_at > lr)) unread += 1;
    }
  }
  return { unread, requests: reqRes.count ?? 0 };
}

/** Live unread-message + friend-request counts, seeded from SSR. */
export function useSocialCounts(initial: SocialCounts): SocialCounts {
  const queryClient = useQueryClient();
  const { data = initial } = useQuery<SocialCounts>({
    queryKey: queryKeys.social.counts(),
    initialData: initial,
    queryFn: fetchSocialCounts,
    refetchInterval: 20000,
    refetchIntervalInBackground: true,
  });

  // EFFECT JUSTIFICATION: a Realtime subscription bound to this island's lifetime
  // (unique topic per instance); message/friendship/read changes invalidate the
  // counts query so the header badges update without a full page refresh.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const invalidate = () =>
      void queryClient.invalidateQueries({ queryKey: queryKeys.social.counts() });
    const channel = supabase
      .channel(`social-counts:${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, invalidate)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, invalidate)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_reads" }, invalidate)
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return data ?? initial;
}
