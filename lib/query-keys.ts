// Central source of truth for TanStack Query keys. Adding a new query?
// Add the key here so every callsite stays consistent and refactors are easy.

export const queryKeys = {
  profile: (userId: string) => ["profile", userId] as const,
  playerPool: () => ["player-pool"] as const,
  historicalStats: (season: number) =>
    ["historical-stats", season] as const,
  clips: () => ["clips"] as const,
} as const;
