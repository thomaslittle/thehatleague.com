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

export function rankIconSrc(value: string | null | undefined): string | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  for (let i = RL_RANK_TIERS.length - 1; i >= 0; i -= 1) {
    if (lower.startsWith(RL_RANK_TIERS[i]!.toLowerCase())) {
      return `/brand/ranks/${i}.png`;
    }
  }
  return null;
}

export function rankWeight(value: string | null | undefined): number {
  if (!value) return -1;
  const lower = value.toLowerCase();
  for (let i = RL_RANK_TIERS.length - 1; i >= 0; i -= 1) {
    if (lower.startsWith(RL_RANK_TIERS[i]!.toLowerCase())) return i;
  }
  return -1;
}
