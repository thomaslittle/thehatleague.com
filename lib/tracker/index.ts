import { manualTrackerAdapter } from "./manual-adapter";
import { automatedTrackerAdapter } from "./automated-adapter";
import type { GetTrackerRanksArgs, TrackerRanks } from "./types";

export * from "./types";

/**
 * Single service interface — callers never care which adapter is live.
 *
 * Today this routes to the manual adapter. When the automated worker comes
 * online, flip the env flag and the rest of the app continues to work.
 */
export async function getTrackerRanks(
  args: GetTrackerRanksArgs,
): Promise<TrackerRanks> {
  const useAutomated =
    process.env.TRACKER_SCRAPER_URL && process.env.TRACKER_SCRAPER_TOKEN;
  const adapter = useAutomated ? automatedTrackerAdapter : manualTrackerAdapter;
  return adapter.getRanks(args);
}
