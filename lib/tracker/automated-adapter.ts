import type {
  GetTrackerRanksArgs,
  TrackerRankAdapter,
  TrackerRanks,
} from "./types";

/**
 * Automated tracker-rank adapter — STUBBED.
 *
 * The intended deploy targets (in order of preference once we pick one):
 *   1. A headless-browser worker with residential / stealth networking
 *      (Playwright behind Browserless, ScrapingBee, or Bright Data),
 *      exposed as an internal HTTPS endpoint.
 *   2. A local companion worker running from a residential IP that scrapes
 *      and writes ranks directly to Supabase using the service-role key.
 *   3. A reputable third-party RL rank API, if one with acceptable ToS
 *      surfaces.
 *
 * For now this throws so callers that ask for the automated path explicitly
 * know it isn't online yet. The product currently funnels everything through
 * the manual adapter; this file is here so the seam exists.
 */
export const automatedTrackerAdapter: TrackerRankAdapter = {
  name: "automated-stub",
  isAutomated: true,
  async getRanks(_args: GetTrackerRanksArgs): Promise<TrackerRanks> {
    throw new Error(
      "Automated tracker adapter not configured yet. Use the manual adapter " +
        "or set TRACKER_SCRAPER_URL + TRACKER_SCRAPER_TOKEN.",
    );
  },
};
