"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { markRead } from "@/app/actions/messages";

/** Keeps an open thread live: marks it read, refreshes on new messages, polls as a fallback. */
export function ThreadLive({ conversationId }: { conversationId: string }) {
  const router = useRouter();

  // EFFECT JUSTIFICATION: a Realtime subscription bound to this thread's lifetime
  // (unique topic per instance) plus a mark-read side effect and a poll fallback —
  // there's no non-effect path for a subscription with cleanup.
  useEffect(() => {
    void markRead(conversationId);
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`thread:${conversationId}:${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          router.refresh();
          void markRead(conversationId);
        },
      )
      .subscribe();
    const poll = setInterval(() => router.refresh(), 5000);
    return () => {
      clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [conversationId, router]);

  return null;
}
