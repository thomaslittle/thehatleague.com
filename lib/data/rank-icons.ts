import { RL_RANK_TIERS, type RankTier } from "./rocket-league-ranks";

// Mirrors RL_RANK_TIERS — index 0..23 = file 0.png..23.png in
// public/brand/ranks/ (sourced from github.com/nixvio64/InGameRank).
const TIER_TO_FILE: Record<RankTier, string> = Object.fromEntries(
  RL_RANK_TIERS.map((tier, i) => [tier, `/brand/ranks/${i}.png`]),
) as Record<RankTier, string>;

/**
 * Resolve the in-game tier image for a stored rank string. The DB
 * sometimes stores tier + division like "Diamond II · Div 3" — match by
 * tier prefix so the image still works.
 *
 * Returns null when no tier prefix matches (e.g. legacy free-text values).
 */
export function rankIconSrc(value: string | null | undefined): string | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  // Scan from highest tier down so multi-word longer tiers ("Grand Champion
  // III") match before shorter prefixes that share a prefix word.
  for (let i = RL_RANK_TIERS.length - 1; i >= 0; i -= 1) {
    const tier = RL_RANK_TIERS[i];
    if (lower.startsWith(tier.toLowerCase())) {
      return TIER_TO_FILE[tier];
    }
  }
  return null;
}
