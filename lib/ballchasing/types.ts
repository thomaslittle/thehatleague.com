// Shared shape for per-player stats fetched from a ballchasing.com group.
// Same architecture as lib/tracker — keep the rest of the app adapter-blind.

export interface BallchasingPlayerStat {
  /** Display name as it appears in ballchasing (often the in-game alias). */
  player: string;
  /** Their THL Discord handle, once we've mapped it. Optional during MVP. */
  discordUsername?: string;
  matches: number;
  goals: number;
  assists: number;
  saves: number;
  /** Demos *given* (offense). */
  demos: number;
  /** Times demolished (defense / unfortunate). */
  deleted: number;
}

export interface BallchasingGroupSummary {
  /** Ballchasing group id — set per Season 4 once the bracket exists. */
  groupId: string;
  /** Display label, e.g. "Season 04 · Regular Season". */
  label: string;
  /** UTC timestamp of the most recent replay added. */
  lastReplayAt: string | null;
  players: BallchasingPlayerStat[];
}

export interface GetBallchasingStatsArgs {
  groupId: string;
}

export interface BallchasingAdapter {
  name: string;
  isAutomated: boolean;
  getGroupStats(args: GetBallchasingStatsArgs): Promise<BallchasingGroupSummary>;
}
