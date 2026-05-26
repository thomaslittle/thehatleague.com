"use client";

import { useOptimistic, useTransition } from "react";
import { HeartIcon } from "@/components/icons/brand";
import { likeClip } from "@/app/actions/clips";

/**
 * Heart-toggle button on a clip card. When a signed-in user clicks, we
 * fire the server action that adds a 👍 reaction to the Discord message
 * via the bot; the count bumps optimistically.
 *
 * Anon users get a no-op heart with a `title=` nudge to sign in — we
 * don't render a separate auth modal here, the rest of the site already
 * points them at /signin.
 */
export function ClipLikeButton({
  messageId,
  initialCount,
  isAuthenticated,
}: {
  messageId: string;
  initialCount: number;
  isAuthenticated: boolean;
}) {
  const [optimistic, addOptimistic] = useOptimistic(
    { count: initialCount, liked: false },
    (state) => ({ count: state.count + 1, liked: true }),
  );
  const [, startTransition] = useTransition();

  const handle = () => {
    if (!isAuthenticated) {
      window.location.href = "/signin?redirect=/";
      return;
    }
    startTransition(() => {
      addOptimistic(null);
      const fd = new FormData();
      fd.set("message_id", messageId);
      void likeClip(fd);
    });
  };

  return (
    <button
      type="button"
      onClick={handle}
      title={
        isAuthenticated
          ? "Like — sends a 👍 to the Discord message"
          : "Sign in to like clips"
      }
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition ${
        optimistic.liked
          ? "bg-thl-orange/15 text-thl-orange"
          : "text-neutral-500 hover:bg-thl-orange/10 hover:text-thl-orange dark:text-neutral-400"
      }`}
    >
      <HeartIcon className="h-3.5 w-3.5" />
      <span className="tabular-nums">{optimistic.count}</span>
    </button>
  );
}
