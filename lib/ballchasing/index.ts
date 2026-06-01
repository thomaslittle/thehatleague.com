import { manualBallchasingAdapter } from "./manual-adapter";
import { automatedBallchasingAdapter } from "./automated-adapter";
import type {
  BallchasingGroupSummary,
  GetBallchasingStatsArgs,
} from "./types";

export * from "./types";

/**
 * Single service interface the rest of the app calls. Routes to the automated
 * adapter when `BALLCHASING_API_KEY` is configured, else the manual placeholder.
 *
 * Resilient: if the automated call fails (bad key, outage, unknown group), it
 * logs and falls back to the manual shape so a match page never hard-crashes on
 * a third-party hiccup.
 */
export async function getBallchasingStats(
  args: GetBallchasingStatsArgs,
): Promise<BallchasingGroupSummary> {
  const useAutomated = !!process.env.BALLCHASING_API_KEY;
  if (!useAutomated) return manualBallchasingAdapter.getGroupStats(args);

  try {
    return await automatedBallchasingAdapter.getGroupStats(args);
  } catch (err) {
    console.warn("ballchasing automated adapter failed; falling back to manual:", err);
    return manualBallchasingAdapter.getGroupStats(args);
  }
}
