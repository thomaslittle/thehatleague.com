"use client";

import Link from "next/link";
import { MessageSquare, Users } from "lucide-react";
import { useSocialCounts, type SocialCounts } from "@/lib/social/use-social-counts";

const ICON_CLASS =
  "relative hidden h-9 w-9 items-center justify-center rounded-lg text-neutral-700 transition hover:bg-neutral-100 hover:text-thl-orange md:inline-flex dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-thl-orange";

function CountBadge({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="absolute -top-1 -right-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-white bg-thl-orange px-1 text-[9px] font-extrabold tabular-nums leading-none text-black dark:border-black"
    >
      {n > 9 ? "9+" : n}
    </span>
  );
}

/** Header Messages + Friends icon links with live unread/request badges. */
export function SocialNav({ initial }: { initial: SocialCounts }) {
  const counts = useSocialCounts(initial);
  return (
    <>
      <Link
        href="/messages"
        className={ICON_CLASS}
        aria-label={counts.unread > 0 ? `Messages — ${counts.unread} unread` : "Messages"}
        title="Messages"
      >
        <MessageSquare className="h-[18px] w-[18px]" aria-hidden />
        {counts.unread > 0 && <CountBadge n={counts.unread} />}
      </Link>
      <Link
        href="/friends"
        className={ICON_CLASS}
        aria-label={counts.requests > 0 ? `Friends — ${counts.requests} requests` : "Friends"}
        title="Friends"
      >
        <Users className="h-[18px] w-[18px]" aria-hidden />
        {counts.requests > 0 && <CountBadge n={counts.requests} />}
      </Link>
    </>
  );
}
