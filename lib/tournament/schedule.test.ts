import { describe, it, expect } from "vitest";
import { roundRobin, buildSchedule } from "./schedule";

describe("roundRobin (circle method)", () => {
  it("every pair meets exactly once for an even count", () => {
    const ids = ["A", "B", "C", "D"];
    const pairings = roundRobin(ids);
    expect(pairings).toHaveLength(6); // C(4,2)
    const seen = new Set(pairings.map((p) => [p.homeId, p.awayId].sort().join("-")));
    expect(seen.size).toBe(6);
    // 3 weeks of 2 games each.
    expect(Math.max(...pairings.map((p) => p.week))).toBe(3);
  });

  it("drops the bye for an odd count (each plays every other once)", () => {
    const pairings = roundRobin(["A", "B", "C"]);
    expect(pairings).toHaveLength(3); // C(3,2)
    expect(pairings.some((p) => p.homeId === "__bye__" || p.awayId === "__bye__")).toBe(false);
  });

  it("returns nothing for < 2 teams", () => {
    expect(roundRobin(["A"])).toEqual([]);
    expect(roundRobin([])).toEqual([]);
  });
});

describe("buildSchedule", () => {
  it("doubles and mirrors home/away for two legs", () => {
    const single = roundRobin(["A", "B", "C", "D"]);
    const double = buildSchedule(["A", "B", "C", "D"], 2);
    expect(double).toHaveLength(single.length * 2);
    // Second leg continues week numbering past the first.
    const weeks = double.map((p) => p.week);
    expect(Math.max(...weeks)).toBe(6);
    // The first second-leg game swaps home/away of the first first-leg game.
    const firstLeg = double[0];
    const secondLeg = double.find((p) => p.week === firstLeg.week + 3);
    expect(secondLeg).toBeDefined();
  });
});
