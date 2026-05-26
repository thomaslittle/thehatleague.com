import "server-only";

import type {
  BallchasingAdapter,
  BallchasingGroupSummary,
} from "./types";

/**
 * Manual adapter — returns whatever curated data we've staged in code.
 *
 * Live path until the bot account + API key + group-id wiring exists. Lets
 * the rest of the app (landing page, dashboards, leaderboards) stay shaped
 * the right way from day one.
 */
export const manualBallchasingAdapter: BallchasingAdapter = {
  name: "manual",
  isAutomated: false,
  async getGroupStats(): Promise<BallchasingGroupSummary> {
    return {
      groupId: "",
      label: "Season 04 · awaiting first match",
      lastReplayAt: null,
      players: [],
    };
  },
};
