import "server-only";

import type {
  BallchasingAdapter,
  BallchasingGroupSummary,
  GetBallchasingStatsArgs,
} from "./types";

/**
 * Automated ballchasing.com adapter — STUBBED.
 *
 * When the league commissioner has provisioned:
 *   - a ballchasing.com group per Season 4 conference/bracket,
 *   - an API key on a league-controlled account (BALLCHASING_API_KEY),
 *
 * implement this by hitting:
 *   GET https://ballchasing.com/api/groups/{groupId}
 *   GET https://ballchasing.com/api/replays?group={groupId}
 *
 * Cache with `next: { revalidate, tags: ['ballchasing:' + groupId] }`
 * so each match-night replay drop refreshes the leaderboards.
 */
export const automatedBallchasingAdapter: BallchasingAdapter = {
  name: "automated-stub",
  isAutomated: true,
  async getGroupStats(_args: GetBallchasingStatsArgs): Promise<BallchasingGroupSummary> {
    throw new Error(
      "Automated ballchasing adapter not configured yet. Set " +
        "BALLCHASING_API_KEY and wire the group ids for Season 4.",
    );
  },
};
