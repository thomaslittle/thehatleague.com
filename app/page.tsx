import { readThemePref } from "@/lib/theme";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { Hero } from "@/components/landing/hero";
import { Manifesto } from "@/components/landing/manifesto";
import { SignupCallout } from "@/components/landing/signup-callout";
import { Standings } from "@/components/landing/standings";
import { PlayerStats } from "@/components/landing/player-stats";
import { Clips } from "@/components/landing/clips";
import { HypeReel } from "@/components/landing/hype-reel";
import { FinalCta } from "@/components/landing/final-cta";
import { RecentSignups } from "@/components/landing/recent-signups";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { POOL_SELECT, type PoolRow } from "@/lib/data/pool";
import { getRecentAnnouncements } from "@/lib/data/announcements";
import { cleanDiscordUsername } from "@/lib/discord/name";
import type { ViewerInfo } from "@/components/landing/site-header";
import { getTwitchLive } from "@/lib/twitch/live";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const [theme, recent, announcements, { count: poolCount }, { data: { user } }, twitch] =
    await Promise.all([
      readThemePref(),
      supabase
        .from("profiles")
        .select(POOL_SELECT)
        .eq("in_player_pool", true)
        .order("created_at", { ascending: false })
        .limit(6),
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
      .select("discord_username, discord_global_name, discord_avatar_url, is_admin")
      .eq("id", user.id)
      .single();
    viewer = {
      isAuthenticated: true,
      displayName:
        profile?.discord_global_name ??
        cleanDiscordUsername(profile?.discord_username) ??
        null,
      username: cleanDiscordUsername(profile?.discord_username),
      avatarUrl: profile?.discord_avatar_url ?? null,
      isAdmin: !!profile?.is_admin,
    };
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <SiteHeader
        theme={theme}
        headlineAnnouncement={headline}
        navCounts={{ "/pool": poolCount ?? 0 }}
        viewer={viewer}
        twitchLive={twitch?.isLive ?? false}
      />
      <main id="main">
        <Hero viewer={viewer} />
        <Manifesto />
        {!viewer?.isAuthenticated && <SignupCallout />}
        <RecentSignups initialRows={(recent.data ?? []) as PoolRow[]} />
        <Standings />
        <PlayerStats />
        <HypeReel />
        <Clips />
        {!viewer?.isAuthenticated && <FinalCta />}
      </main>
      <SiteFooter />
    </div>
  );
}
