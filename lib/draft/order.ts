/**
 * Pure snake-draft order math. No I/O — the single source of truth for "who
 * picks when", mirrored by the Postgres `draft_team_at` function so the server
 * and client always agree. All `overall` pick numbers are 1-based.
 */
export type DraftType = "snake" | "linear";

export interface DraftSlot {
  /** 1-based round number. */
  round: number;
  /** 1-based index of this pick within its round. */
  pickInRound: number;
  /** 1-based position in the seeded draft order (the team's slot). */
  position: number;
}

/** Total picks the draft will make (teams × picks-per-team). */
export function totalPicks(teamCount: number, picksPerTeam: number): number {
  return Math.max(0, teamCount) * Math.max(0, picksPerTeam);
}

/** Map a 1-based overall pick to its round / position (snake-aware). */
export function overallToSlot(
  overall: number,
  teamCount: number,
  type: DraftType = "snake",
): DraftSlot | null {
  if (teamCount <= 0 || overall < 1) return null;
  const round = Math.ceil(overall / teamCount);
  const idx = (overall - 1) % teamCount; // 0-based within the round
  const position =
    type === "snake" && round % 2 === 0 ? teamCount - idx : idx + 1;
  return { round, pickInRound: idx + 1, position };
}

/**
 * Team on the clock for a given overall pick.
 * `draftOrder` is the seeded order: index 0 = position 1, etc.
 */
export function teamForOverall(
  overall: number,
  draftOrder: readonly string[],
  type: DraftType = "snake",
): string | null {
  const slot = overallToSlot(overall, draftOrder.length, type);
  if (!slot) return null;
  return draftOrder[slot.position - 1] ?? null;
}

/** Has the draft finished (every team has its full roster)? */
export function isDraftComplete(
  currentOverall: number,
  teamCount: number,
  picksPerTeam: number,
): boolean {
  return currentOverall > totalPicks(teamCount, picksPerTeam);
}

/**
 * Full ordered list of upcoming slots, for previewing the board.
 * Returns `{ overall, round, position, teamId }[]`.
 */
export function buildDraftPreview(
  draftOrder: readonly string[],
  picksPerTeam: number,
  type: DraftType = "snake",
): { overall: number; round: number; position: number; teamId: string }[] {
  const out: { overall: number; round: number; position: number; teamId: string }[] = [];
  const total = totalPicks(draftOrder.length, picksPerTeam);
  for (let overall = 1; overall <= total; overall += 1) {
    const slot = overallToSlot(overall, draftOrder.length, type);
    if (!slot) continue;
    const teamId = draftOrder[slot.position - 1];
    if (teamId) out.push({ overall, round: slot.round, position: slot.position, teamId });
  }
  return out;
}
