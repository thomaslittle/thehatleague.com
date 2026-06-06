/**
 * Pure draft-order seeding. Builds the ordered list of team ids (position 1
 * picks first) from the configured seed method. No I/O — the action persists
 * the result into `draft_order`.
 */
import { rankWeight } from "@/lib/data/rank-sort";

export type SeedMethod = "rank_asc" | "rank_desc" | "random" | "manual";

export interface SeedTeam {
  id: string;
  /** Captain's peak rank string (drives rank-based seeding). */
  captainPeakRank: string | null;
  /** ISO timestamp, used as a deterministic tie-break. */
  createdAt: string;
}

/**
 * Deterministic order for rank-based methods. `rank_asc` (default) puts the
 * LOWEST-ranked captain first for competitive balance; `rank_desc` reverses.
 * Ties break by `createdAt` then `id` so the order is stable + reproducible.
 * `random` shuffles with an injectable rng (defaults to Math.random — only
 * used at action time, never in a pure test path). `manual` returns input order.
 */
export function seedDraftOrder(
  teams: readonly SeedTeam[],
  method: SeedMethod,
  rng: () => number = Math.random,
): string[] {
  const arr = [...teams];

  if (method === "manual") return arr.map((t) => t.id);

  if (method === "random") {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.map((t) => t.id);
  }

  const dir = method === "rank_desc" ? -1 : 1;
  arr.sort((a, b) => {
    const wa = rankWeight(a.captainPeakRank);
    const wb = rankWeight(b.captainPeakRank);
    if (wa !== wb) return (wa - wb) * dir;
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
    return a.id < b.id ? -1 : 1;
  });
  return arr.map((t) => t.id);
}
