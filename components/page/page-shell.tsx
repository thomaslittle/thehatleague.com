import type { ReactNode } from "react";
import { readThemePref } from "@/lib/theme";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { getRecentAnnouncements } from "@/lib/data/announcements";
import { getViewer, getPoolStats } from "@/lib/auth/viewer";
import { getTwitchLive } from "@/lib/twitch/live";

export async function PageShell({ children }: { children: ReactNode }) {
  const [theme, announcements, { poolCount }, viewer, twitch] =
    await Promise.all([
      readThemePref(),
      getRecentAnnouncements(1),
      getPoolStats(),
      getViewer(),
      getTwitchLive(),
    ]);
  const headline = announcements[0]
    ? { slug: announcements[0].slug, title: announcements[0].title }
    : null;

  return (
    <div className="min-h-screen text-neutral-900 dark:text-white">
      <SiteHeader
        theme={theme}
        headlineAnnouncement={headline}
        navCounts={{ "/pool": poolCount }}
        viewer={viewer}
        twitchLive={twitch?.isLive ?? false}
      />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}
