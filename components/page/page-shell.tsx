import type { ReactNode } from "react";
import { readThemePref } from "@/lib/theme";
import { SiteHeader, type ViewerInfo } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { getRecentAnnouncements } from "@/lib/data/announcements";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cleanDiscordUsername } from "@/lib/discord/name";
import { getTwitchLive } from "@/lib/twitch/live";

export async function PageShell({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const [theme, announcements, { count: poolCount }, { data: { user } }, twitch] =
    await Promise.all([
      readThemePref(),
      getRecentAnnouncements(1),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("in_player_pool", true),
      supabase.auth.getUser(),
      getTwitchLive(),
    ]);
  const headline = announcements[0]
    ? { slug: announcements[0].slug, title: announcements[0].title }
    : null;

  let viewer: ViewerInfo | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, is_admin",
      )
      .eq("id", user.id)
      .single();
    viewer = {
      isAuthenticated: true,
      displayName:
        profile?.discord_global_name ??
        cleanDiscordUsername(profile?.discord_username) ??
        null,
      username: cleanDiscordUsername(profile?.discord_username),
      avatarUrl: profile?.profile_avatar_url ?? profile?.discord_avatar_url ?? null,
      isAdmin: !!profile?.is_admin,
    };
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-black dark:text-white">
      <SiteHeader
        theme={theme}
        headlineAnnouncement={headline}
        navCounts={{ "/pool": poolCount ?? 0 }}
        viewer={viewer}
        twitchLive={twitch?.isLive ?? false}
      />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}
