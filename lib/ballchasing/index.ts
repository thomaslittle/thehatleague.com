import { manualBallchasingAdapter } from "./manual-adapter";
import { automatedBallchasingAdapter } from "./automated-adapter";
import type {
  BallchasingGroupSummary,
  GetBallchasingStatsArgs,
} from "./types";

export * from "./types";

/**
 * Single service interface the rest of the app calls. Today this routes to
 * the manual adapter; flip the env flag when the automated worker is wired.
 *
 * Mirrors lib/tracker so the architectural pattern stays consistent.
 */
export async function getBallchasingStats(
  args: GetBallchasingStatsArgs,
): Promise<BallchasingGroupSummary> {
  const useAutomated = !!process.env.BALLCHASING_API_KEY;
  const adapter = useAutomated
    ? automatedBallchasingAdapter
    : manualBallchasingAdapter;
  return adapter.getGroupStats(args);
}
