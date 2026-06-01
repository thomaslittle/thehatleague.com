import { describe, it, expect } from "vitest";
import { sortByDraftValue, bestAvailable, autoPickChoice, type AvailablePlayer } from "./available";

const pool: AvailablePlayer[] = [
  { id: "low", peak_rank: "Diamond I", rank_3v3: "Diamond I", rank_2v2: "Platinum III", created_at: "2024-01-01" },
  { id: "high", peak_rank: "Grand Champion II", rank_3v3: "Grand Champion I", rank_2v2: "Champion III", created_at: "2024-01-02" },
  { id: "mid", peak_rank: "Champion II", rank_3v3: "Champion I", rank_2v2: "Diamond III", created_at: "2024-01-03" },
];

describe("sortByDraftValue", () => {
  it("orders best peak rank first", () => {
    expect(sortByDraftValue(pool).map((p) => p.id)).toEqual(["high", "mid", "low"]);
  });
});

describe("bestAvailable", () => {
  it("excludes drafted players", () => {
    const result = bestAvailable(pool, new Set(["high"]));
    expect(result.map((p) => p.id)).toEqual(["mid", "low"]);
  });
});

describe("autoPickChoice", () => {
  it("prefers the top available queued player", () => {
    expect(autoPickChoice(pool, new Set(), ["mid", "high"])).toBe("mid");
  });

  it("skips queued players already drafted", () => {
    expect(autoPickChoice(pool, new Set(["mid"]), ["mid", "low"])).toBe("low");
  });

  it("falls back to best available when the queue is empty/exhausted", () => {
    expect(autoPickChoice(pool, new Set(), [])).toBe("high");
  });

  it("returns null when the pool is exhausted", () => {
    expect(autoPickChoice(pool, new Set(["high", "mid", "low"]), [])).toBeNull();
  });
});
