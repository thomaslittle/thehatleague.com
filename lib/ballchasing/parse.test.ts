import { describe, it, expect } from "vitest";
import { parseBallchasingGroup } from "./parse";

describe("parseBallchasingGroup", () => {
  const sample = {
    id: "grp-123",
    name: "Season 04 · Sombrero",
    created: "2026-05-01T00:00:00Z",
    players: [
      { name: "Striker", cumulative: { games: 5, core: { goals: 12, assists: 3, saves: 8 }, demo: { inflicted: 4, taken: 2 } } },
      { name: "Wall", cumulative: { games: 5, core: { goals: 2, assists: 6, saves: 21 }, demo: { inflicted: 1, taken: 9 } } },
    ],
  };

  it("maps cumulative stats and sorts by goals desc", () => {
    const out = parseBallchasingGroup(sample, "fallback");
    expect(out.groupId).toBe("grp-123");
    expect(out.label).toBe("Season 04 · Sombrero");
    expect(out.lastReplayAt).toBe("2026-05-01T00:00:00Z");
    expect(out.players.map((p) => p.player)).toEqual(["Striker", "Wall"]);
    expect(out.players[0]).toMatchObject({ goals: 12, assists: 3, saves: 8, demos: 4, deleted: 2, matches: 5 });
  });

  it("is resilient to missing fields", () => {
    const out = parseBallchasingGroup({ players: [{}] }, "fallback");
    expect(out.groupId).toBe("fallback");
    expect(out.players[0]).toMatchObject({ player: "Unknown", goals: 0, saves: 0 });
  });

  it("handles an empty / malformed payload", () => {
    expect(parseBallchasingGroup(null, "g").players).toEqual([]);
    expect(parseBallchasingGroup({}, "g").label).toBe("Ballchasing group");
  });
});
