/**
 * Pure round-robin scheduling (circle method). No I/O — the action persists the
 * pairings into `matches`. Each team plays every other once per round-robin; a
 * `bye` team is inserted when the count is odd and those pairings are dropped.
 *
 * For a double round-robin, the second leg swaps home/away so each team hosts
 * an equal share.
 */

export interface Pairing {
  /** 1-based week / round number. */
  week: number;
  homeId: string;
  awayId: string;
}

const BYE = "__bye__";

/** Single round-robin pairings via the circle method. */
export function roundRobin(teamIds: readonly string[]): Pairing[] {
  const teams = [...teamIds];
  if (teams.length < 2) return [];
  if (teams.length % 2 === 1) teams.push(BYE);

  const n = teams.length;
  const rounds = n - 1;
  const half = n / 2;
  const out: Pairing[] = [];

  // Fixed first team; the rest rotate clockwise each round.
  const arr = [...teams];
  for (let r = 0; r < rounds; r += 1) {
    for (let i = 0; i < half; i += 1) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a !== BYE && b !== BYE) {
        // Alternate home/away by round + slot so hosting is balanced.
        const homeFirst = (r + i) % 2 === 0;
        out.push({
          week: r + 1,
          homeId: homeFirst ? a : b,
          awayId: homeFirst ? b : a,
        });
      }
    }
    // Rotate: keep arr[0] fixed, move the last into position 1.
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop() as string);
    arr.splice(0, arr.length, fixed, ...rest);
  }
  return out;
}

/**
 * Full schedule. `legs` = 1 (single) or 2 (double; second leg mirrors home/away
 * and continues the week numbering).
 */
export function buildSchedule(teamIds: readonly string[], legs = 1): Pairing[] {
  const base = roundRobin(teamIds);
  if (legs <= 1 || base.length === 0) return base;

  const weeksPerLeg = Math.max(...base.map((p) => p.week));
  const second = base.map((p) => ({
    week: p.week + weeksPerLeg,
    homeId: p.awayId,
    awayId: p.homeId,
  }));
  return [...base, ...second];
}
