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
import { getViewer, getPoolStats, getPoolAvatars } from "@/lib/auth/viewer";
import { getTwitchLive } from "@/lib/twitch/live";
import { getActiveSeason } from "@/lib/data/season";
import { deriveEvents } from "@/lib/data/events";
import { UpcomingEvents } from "@/components/landing/upcoming-events";
import { EventCountdown } from "@/components/landing/event-countdown";
import { getFnfTickerLines, getFnfHistory } from "@/lib/data/fnf";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const [
    theme,
    recent,
    announcements,
    stats,
    viewer,
    twitch,
    poolAvatars,
    fnfTicker,
  ] = await Promise.all([
    readThemePref(),
    supabase
      .from("profiles")
      .select(POOL_SELECT)
      .eq("in_player_pool", true)
      .eq("is_mock", false)
      .order("created_at", { ascending: false })
      .limit(6),
    getRecentAnnouncements(1),
    getPoolStats(),
    getViewer(),
    getTwitchLive(),
    getPoolAvatars(),
    getFnfTickerLines(),
  ]);
  const headline = announcements[0]
    ? { slug: announcements[0].slug, title: announcements[0].title }
    : null;
  const season = await getActiveSeason();
  const events = deriveEvents(season);

  // Reigning Friday Nite Fights champions, featured inside the hero.
  const fnfHistory = await getFnfHistory();
  const fnfChampions = fnfHistory[0]?.champions
    ? {
        teamName: fnfHistory[0].champions.name,
        tournamentId: fnfHistory[0].tournamentId,
        players: fnfHistory[0].champions.members.map((m) => ({
          id: m.id,
          name: m.name,
          username: m.username,
          avatarUrl: m.avatarUrl,
          rank: m.rankValue,
        })),
      }
    : null;

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <SiteHeader
        theme={theme}
        headlineAnnouncement={headline}
        navCounts={{ "/pool": stats.poolCount }}
        viewer={viewer}
        twitchLive={twitch?.isLive ?? false}
      />
      <main id="main">
        <Hero
          viewer={viewer}
          poolCount={stats.poolCount}
          captainCount={stats.captainCount}
          poolAvatars={poolAvatars}
          tickerItems={fnfTicker}
          fnfChampions={fnfChampions}
        />
        <EventCountdown />
        <UpcomingEvents events={events} />
        <Manifesto viewer={viewer} />
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
