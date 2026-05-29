import type {
  GetTrackerRanksArgs,
  TrackerRankAdapter,
  TrackerRanks,
} from "./types";

/**
 * Manual-confirm adapter (the live path for v1).
 *
 * Why: rocketleague.tracker.network is gated by Cloudflare's bot detection,
 * which blocks Vercel/Supabase serverless functions. The user pastes their
 * tracker URL, we record it, and they confirm their three ranks themselves.
 * No scraping. Zero risk.
 */
export const manualTrackerAdapter: TrackerRankAdapter = {
  name: "manual",
  isAutomated: false,
  async getRanks({ trackerUrl, manual }: GetTrackerRanksArgs): Promise<TrackerRanks> {
    return {
      trackerUrl,
      rank2v2: manual?.rank2v2 ?? "",
      rank3v3: manual?.rank3v3 ?? "",
      peakRank: manual?.peakRank ?? "",
      peakPlaylist: manual?.peakPlaylist ?? null,
    };
  },
};
