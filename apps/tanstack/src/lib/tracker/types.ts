// Shared interface so the rest of the app never cares which adapter is live.

export type RankPlaylist = "2v2" | "3v3" | "1v1" | "hoops" | "rumble" | "dropshot" | "snowday" | "other";

export interface TrackerRanks {
  /** Display string e.g. "Diamond II · Div 3". */
  rank2v2: string;
  rank3v3: string;
  peakRank: string;
  /** Which playlist the peak rank was earned in. */
  peakPlaylist: RankPlaylist | null;
  /** Raw URL the user supplied — preserved so we can re-pull later. */
  trackerUrl: string;
}

export interface GetTrackerRanksArgs {
  trackerUrl: string;
  /** Fallback / override values entered manually by the user. */
  manual?: Partial<Omit<TrackerRanks, "trackerUrl">>;
}

export interface TrackerRankAdapter {
  name: string;
  isAutomated: boolean;
  getRanks(args: GetTrackerRanksArgs): Promise<TrackerRanks>;
}

export const TRACKER_URL_RE =
  /^https?:\/\/(www\.)?rocketleague\.tracker\.network\/rocket-league\/profile\/(epic|steam|psn|xbl|switch)\/[^/]+\/?/i;

export function isValidTrackerUrl(url: string): boolean {
  return TRACKER_URL_RE.test(url.trim());
}
