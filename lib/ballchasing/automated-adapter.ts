import "server-only";

import type {
  BallchasingAdapter,
  BallchasingGroupSummary,
  GetBallchasingStatsArgs,
} from "./types";
import { parseBallchasingGroup } from "./parse";

/**
 * Automated ballchasing.com adapter. Fetches a group's aggregated per-player
 * stats from the ballchasing API and maps them to our adapter-blind shape.
 *
 * Auth: ballchasing expects the raw API key in the `Authorization` header (no
 * "Bearer " prefix). Requires `BALLCHASING_API_KEY` + a group id minted for the
 * Season 4 bracket/conference. Cached per group with a tag so a match-night
 * replay drop can revalidate.
 */
export const automatedBallchasingAdapter: BallchasingAdapter = {
  name: "automated",
  isAutomated: true,
  async getGroupStats({ groupId }: GetBallchasingStatsArgs): Promise<BallchasingGroupSummary> {
    const key = process.env.BALLCHASING_API_KEY;
    if (!key) throw new Error("BALLCHASING_API_KEY is not set.");
    if (!groupId) throw new Error("A ballchasing group id is required.");

    const res = await fetch(`https://ballchasing.com/api/groups/${encodeURIComponent(groupId)}`, {
      headers: { Authorization: key },
      next: { revalidate: 300, tags: [`ballchasing:${groupId}`] },
    });
    if (!res.ok) {
      throw new Error(`ballchasing.com responded ${res.status} for group ${groupId}`);
    }
    const data = await res.json();
    return parseBallchasingGroup(data, groupId);
  },
};
