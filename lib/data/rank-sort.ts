import { RL_RANK_TIERS } from "./rocket-league-ranks";

/**
 * Sortable numeric weight for a Rocket League rank string. Higher = better.
 * Strings that aren't in the canonical tier list sort last (weight = -1).
 */
export function rankWeight(value: string | null | undefined): number {
  if (!value) return -1;
  // Match the tier prefix even if the user appended a division (e.g. "Diamond II · Div 3").
  const lower = value.toLowerCase();
  for (let i = RL_RANK_TIERS.length - 1; i >= 0; i -= 1) {
    if (lower.startsWith(RL_RANK_TIERS[i].toLowerCase())) return i;
  }
  return -1;
}
