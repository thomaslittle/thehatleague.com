// Central source of truth for TanStack Query keys. Adding a new query?
// Add the key here so every callsite stays consistent and refactors are easy.
//
// IMPORTANT: every distinct query SHAPE (filters / sort / limit) must have
// its own key. Sharing a key between, say, a recent-signups widget that
// pulls 6 rows and a full pool board that pulls everything will cause the
// smaller dataset to overwrite the bigger one in cache the moment they
// run in the same browser session.

export const queryKeys = {
  profile: (userId: string) => ["profile", userId] as const,
  playerPool: {
    /** Match any cached player-pool query — handy for bulk invalidation. */
    all: () => ["player-pool"] as const,
    /** Compact "latest sign-ups" list rendered on the landing page. */
    recent: () => ["player-pool", "recent"] as const,
    /** Full pool roster on /pool. */
    full: () => ["player-pool", "full"] as const,
  },
  historicalStats: (season: number) =>
    ["historical-stats", season] as const,
  clips: () => ["clips"] as const,
} as const;
