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
