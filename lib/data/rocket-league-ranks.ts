// Rocket League rank tiers, used by the onboarding form.

export const RL_RANK_TIERS = [
  "Unranked",
  "Bronze I",
  "Bronze II",
  "Bronze III",
  "Silver I",
  "Silver II",
  "Silver III",
  "Gold I",
  "Gold II",
  "Gold III",
  "Platinum I",
  "Platinum II",
  "Platinum III",
  "Diamond I",
  "Diamond II",
  "Diamond III",
  "Champion I",
  "Champion II",
  "Champion III",
  "Grand Champion I",
  "Grand Champion II",
  "Grand Champion III",
  "Supersonic Legend",
] as const;

export type RankTier = (typeof RL_RANK_TIERS)[number];

// Short-form labels used in narrow chips where the full tier name would
// overflow (e.g. "Grand Champion I" -> "GC1"). Keeps the icon lookup
// using the full value while letting the UI display the abbreviation.
const TIER_ABBREV: Record<RankTier, string> = {
  Unranked: "UR",
  "Bronze I": "B1",
  "Bronze II": "B2",
  "Bronze III": "B3",
  "Silver I": "S1",
  "Silver II": "S2",
  "Silver III": "S3",
  "Gold I": "G1",
  "Gold II": "G2",
  "Gold III": "G3",
  "Platinum I": "P1",
  "Platinum II": "P2",
  "Platinum III": "P3",
  "Diamond I": "D1",
  "Diamond II": "D2",
  "Diamond III": "D3",
  "Champion I": "C1",
  "Champion II": "C2",
  "Champion III": "C3",
  "Grand Champion I": "GC1",
  "Grand Champion II": "GC2",
  "Grand Champion III": "GC3",
  "Supersonic Legend": "SSL",
};

/**
 * Resolve the short-form abbreviation for a stored rank string. Falls back
 * to the original value when the prefix doesn't match a known tier (legacy
 * free-text values). Mirrors the prefix-scan in rankIconSrc so multi-word
 * tiers ("Grand Champion III") match before shorter prefixes that share a
 * leading word.
 */
export function rankAbbrev(value: string | null | undefined): string {
  if (!value) return "—";
  const lower = value.toLowerCase();
  for (let i = RL_RANK_TIERS.length - 1; i >= 0; i -= 1) {
    const tier = RL_RANK_TIERS[i];
    if (lower.startsWith(tier.toLowerCase())) {
      return TIER_ABBREV[tier];
    }
  }
  return value;
}

export const RL_PEAK_PLAYLISTS = [
  "2v2",
  "3v3",
  "1v1",
  "hoops",
  "rumble",
  "dropshot",
  "snowday",
  "other",
] as const;
