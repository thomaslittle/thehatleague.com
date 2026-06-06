import type { BallchasingGroupSummary, BallchasingPlayerStat } from "./types";

// Shapes of the bits of the ballchasing.com `GET /api/groups/{id}` response we
// consume. The API returns far more; we only map what the app needs. Kept as a
// pure function so it's unit-testable without network.
interface RawGroupPlayer {
  name?: string;
  cumulative?: {
    games?: number;
    core?: { goals?: number; assists?: number; saves?: number };
    demo?: { inflicted?: number; taken?: number };
  };
}
interface RawGroup {
  id?: string;
  name?: string;
  created?: string;
  players?: RawGroupPlayer[];
}

/** Map a ballchasing group payload to our adapter-blind summary shape. */
export function parseBallchasingGroup(raw: unknown, groupId: string): BallchasingGroupSummary {
  const data = (raw ?? {}) as RawGroup;
  const players: BallchasingPlayerStat[] = (data.players ?? []).map((p) => ({
    player: p.name ?? "Unknown",
    matches: p.cumulative?.games ?? 0,
    goals: p.cumulative?.core?.goals ?? 0,
    assists: p.cumulative?.core?.assists ?? 0,
    saves: p.cumulative?.core?.saves ?? 0,
    demos: p.cumulative?.demo?.inflicted ?? 0,
    deleted: p.cumulative?.demo?.taken ?? 0,
  }));
  // Best players first by goals — handy for leaderboards.
  players.sort((a, b) => b.goals - a.goals);
  return {
    groupId: data.id ?? groupId,
    label: data.name ?? "Ballchasing group",
    lastReplayAt: data.created ?? null,
    players,
  };
}
