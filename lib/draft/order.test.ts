import { describe, it, expect } from "vitest";
import {
  overallToSlot,
  teamForOverall,
  totalPicks,
  isDraftComplete,
  buildDraftPreview,
} from "./order";

describe("overallToSlot (snake math)", () => {
  it("maps a 4-team snake to mirrored rounds", () => {
    const positions = Array.from({ length: 12 }, (_, i) => overallToSlot(i + 1, 4)?.position);
    // R1 forward, R2 reverse, R3 forward.
    expect(positions).toEqual([1, 2, 3, 4, 4, 3, 2, 1, 1, 2, 3, 4]);
  });

  it("is linear when type=linear", () => {
    const positions = Array.from({ length: 8 }, (_, i) => overallToSlot(i + 1, 4, "linear")?.position);
    expect(positions).toEqual([1, 2, 3, 4, 1, 2, 3, 4]);
  });

  it("tracks round + pick-in-round", () => {
    expect(overallToSlot(5, 4)).toEqual({ round: 2, pickInRound: 1, position: 4 });
    expect(overallToSlot(1, 4)).toEqual({ round: 1, pickInRound: 1, position: 1 });
  });

  it("returns null for invalid input", () => {
    expect(overallToSlot(0, 4)).toBeNull();
    expect(overallToSlot(1, 0)).toBeNull();
  });
});

describe("teamForOverall", () => {
  const order = ["A", "B", "C", "D"];
  it("returns the right team across the snake turn", () => {
    expect(teamForOverall(1, order)).toBe("A");
    expect(teamForOverall(4, order)).toBe("D");
    expect(teamForOverall(5, order)).toBe("D"); // snake back
    expect(teamForOverall(8, order)).toBe("A");
    expect(teamForOverall(9, order)).toBe("A");
  });
});

describe("totals + completion + preview", () => {
  it("totalPicks multiplies and floors at zero", () => {
    expect(totalPicks(4, 3)).toBe(12);
    expect(totalPicks(-1, 3)).toBe(0);
  });
  it("isDraftComplete once past the last overall", () => {
    expect(isDraftComplete(12, 4, 3)).toBe(false);
    expect(isDraftComplete(13, 4, 3)).toBe(true);
  });
  it("buildDraftPreview returns one entry per pick in order", () => {
    const preview = buildDraftPreview(["A", "B"], 2);
    expect(preview).toEqual([
      { overall: 1, round: 1, position: 1, teamId: "A" },
      { overall: 2, round: 1, position: 2, teamId: "B" },
      { overall: 3, round: 2, position: 2, teamId: "B" },
      { overall: 4, round: 2, position: 1, teamId: "A" },
    ]);
  });
});
