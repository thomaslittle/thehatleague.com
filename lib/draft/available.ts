/**
 * Pure "best available" ranking for the draft. Sorts undrafted players by a
 * composite of their ranks so the control room, overlay, and auto-pick
 * fallback all agree on draft value. No I/O.
 */
import { rankWeight } from "@/lib/data/rank-sort";

export interface AvailablePlayer {
  id: string;
  peak_rank: string | null;
  rank_3v3: string | null;
  rank_2v2: string | null;
  /** ISO join timestamp — earliest joiner wins a full tie. */
  created_at: string;
}

/** Sort by peak rank, then 3v3, then 2v2, then join order (best first). */
export function sortByDraftValue<T extends AvailablePlayer>(players: readonly T[]): T[] {
  return [...players].sort((a, b) => {
    const dp = rankWeight(b.peak_rank) - rankWeight(a.peak_rank);
    if (dp !== 0) return dp;
    const d3 = rankWeight(b.rank_3v3) - rankWeight(a.rank_3v3);
    if (d3 !== 0) return d3;
    const d2 = rankWeight(b.rank_2v2) - rankWeight(a.rank_2v2);
    if (d2 !== 0) return d2;
    return a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0;
  });
}

/** Undrafted players, best first. */
export function bestAvailable<T extends AvailablePlayer>(
  pool: readonly T[],
  draftedIds: ReadonlySet<string>,
): T[] {
  return sortByDraftValue(pool.filter((p) => !draftedIds.has(p.id)));
}

/**
 * The fair auto-pick choice: the team's top *available* queued player, else
 * the best available overall. Returns the chosen player's id, or null if the
 * pool is exhausted.
 */
export function autoPickChoice<T extends AvailablePlayer>(
  pool: readonly T[],
  draftedIds: ReadonlySet<string>,
  queuedProfileIds: readonly string[],
): string | null {
  const available = new Set(
    pool.filter((p) => !draftedIds.has(p.id)).map((p) => p.id),
  );
  for (const id of queuedProfileIds) {
    if (available.has(id)) return id;
  }
  const best = bestAvailable(pool, draftedIds);
  return best[0]?.id ?? null;
}
