import Link from "next/link";
import { ArrowRight, DiscordIcon } from "@/components/icons/brand";
import type { ViewerInfo } from "@/components/landing/site-header";

const PRIMARY =
  "inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3.5 font-bold text-black transition hover:bg-thl-orange-deep";
const SECONDARY =
  "inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-5 py-3.5 font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300";

/**
 * Session-aware primary CTA used across page heros. Swaps copy + target
 * based on whether the viewer is signed in and already in the pool:
 *
 *  - signed out         → "{signedOutLabel}" → /signin
 *  - signed in, not in   → "Join the player pool" → /settings
 *  - signed in, in pool  → "You're in — open dashboard" → /dashboard
 */
export function SessionCta({
  viewer,
  signedOutLabel = "Add yourself",
}: {
  viewer: ViewerInfo | null;
  signedOutLabel?: string;
}) {
  if (!viewer?.isAuthenticated) {
    return (
      <Link href="/signin" className={PRIMARY}>
        <DiscordIcon className="h-5 w-5" />
        {signedOutLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  if (!viewer.inPool) {
    return (
      <Link href="/settings" className={PRIMARY}>
        Join the player pool
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-2 rounded-xl border border-thl-orange/40 bg-thl-orange/10 px-4 py-3 text-sm font-bold text-thl-orange">
        <CheckIcon className="h-4 w-4" />
        You&apos;re in the pool
      </span>
      <Link href="/dashboard" className={SECONDARY}>
        Open your dashboard
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
