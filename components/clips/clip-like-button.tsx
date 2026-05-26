"use client";

import { useState, useTransition } from "react";
import { HeartIcon } from "@/components/icons/brand";
import { likeClip } from "@/app/actions/clips";

/**
 * Heart-toggle button on a clip card. When a signed-in user clicks, we
 * fire the server action that adds a 👍 reaction to the Discord message
 * via their Discord OAuth token; the count bumps optimistically.
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
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [failed, setFailed] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handle = () => {
    if (!isAuthenticated) {
      window.location.href = "/signin?redirect=/";
      return;
    }
    if (liked || isPending) return;
    startTransition(() => {
      const fd = new FormData();
      fd.set("message_id", messageId);
      void likeClip(fd).then((result) => {
        if (!result.ok) {
          setFailed(true);
          return;
        }
        setFailed(false);
        setLiked(true);
        setCount((current) => current + 1);
      });
    });
  };

  return (
    <button
      type="button"
      onClick={handle}
      title={
        failed
          ? "Discord did not accept this reaction"
          : isAuthenticated
            ? "Like — reacts from your Discord account"
            : "Sign in to like clips"
      }
      disabled={isPending || liked}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition ${
        liked
          ? "bg-thl-orange/15 text-thl-orange"
          : failed
            ? "bg-red-500/10 text-red-500"
          : "text-neutral-500 hover:bg-thl-orange/10 hover:text-thl-orange dark:text-neutral-400"
      } disabled:cursor-default disabled:opacity-80`}
    >
      <HeartIcon className="h-3.5 w-3.5" />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
