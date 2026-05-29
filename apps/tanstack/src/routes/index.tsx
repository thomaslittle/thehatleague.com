import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Hero } from "@/components/hero";
import { Manifesto } from "@/components/manifesto";
import { SignupCallout } from "@/components/signup-callout";
import { RecentSignups } from "@/components/recent-signups";
import { Standings } from "@/components/standings";
import { PlayerStats } from "@/components/player-stats";
import { HypeReel } from "@/components/hype-reel";
import { Clips } from "@/components/clips";
import { FinalCta } from "@/components/final-cta";
import { SiteFooter } from "@/components/site-footer";
import { getRecentSignups } from "@/server/pool";
import { getRecentClips } from "@/server/clips";

export const Route = createFileRoute("/")({
  component: LandingPage,
  loader: async () => {
    const [recent, clips] = await Promise.all([
      getRecentSignups({ data: { limit: 6 } }),
      getRecentClips({ data: { limit: 6 } }),
    ]);
    return { recent, clips };
  },
});

function LandingPage() {
  const { recent, clips } = Route.useLoaderData();
  const { viewer } = useLoaderData({ from: "__root__" });
  const heroViewer = viewer
    ? {
        isAuthenticated: true,
        displayName: viewer.displayName,
        discordUsername: viewer.discordUsername,
      }
    : null;
  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main">
        <Hero viewer={heroViewer} />
        <Manifesto />
        {!viewer && <SignupCallout />}
        <RecentSignups rows={recent} />
        <Standings />
        <PlayerStats />
        <HypeReel />
        <Clips clips={clips} />
        {!viewer && <FinalCta />}
      </main>
      <SiteFooter />
    </div>
  );
}
