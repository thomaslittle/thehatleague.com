import { describe, it, expect } from "vitest";
import { seedDraftOrder, type SeedTeam } from "./seeding";

const teams: SeedTeam[] = [
  { id: "gc", captainPeakRank: "Grand Champion I", createdAt: "2024-01-01" },
  { id: "plat", captainPeakRank: "Platinum II", createdAt: "2024-01-02" },
  { id: "diamond", captainPeakRank: "Diamond III", createdAt: "2024-01-03" },
];

describe("seedDraftOrder", () => {
  it("rank_asc puts the lowest-ranked captain first (balance)", () => {
    expect(seedDraftOrder(teams, "rank_asc")).toEqual(["plat", "diamond", "gc"]);
  });

  it("rank_desc puts the highest-ranked captain first", () => {
    expect(seedDraftOrder(teams, "rank_desc")).toEqual(["gc", "diamond", "plat"]);
  });

  it("manual keeps input order", () => {
    expect(seedDraftOrder(teams, "manual")).toEqual(["gc", "plat", "diamond"]);
  });

  it("random is a permutation (deterministic with injected rng)", () => {
    const rng = () => 0; // always picks index 0 in the Fisher–Yates swap
    const out = seedDraftOrder(teams, "random", rng);
    expect([...out].sort()).toEqual(["diamond", "gc", "plat"]);
    expect(out).toHaveLength(3);
  });

  it("breaks rank ties deterministically by createdAt then id", () => {
    const tied: SeedTeam[] = [
      { id: "b", captainPeakRank: "Champion I", createdAt: "2024-02-02" },
      { id: "a", captainPeakRank: "Champion I", createdAt: "2024-02-01" },
    ];
    expect(seedDraftOrder(tied, "rank_asc")).toEqual(["a", "b"]);
  });
});
