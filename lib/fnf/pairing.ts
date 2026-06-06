// Pure tournament logic for Friday Nite Fights — no I/O, fully unit-testable.
// Covers: rank-balanced 2v2 team generation, Swiss pairing + standings, and
// single-elimination bracket construction. The server actions call these and
// persist the result through SECURITY DEFINER RPCs.

export type FnfPlayer = { id: string; weight: number };

export type FnfTeamLite = { id: string; seed: number; name: string };

export type FnfMatchLite = {
  stage: "swiss" | "playoffs";
  round: number;
  teamAId: string | null;
  teamBId: string | null;
  winnerTeamId: string | null;
  scoreA: number | null;
  scoreB: number | null;
  /** Per-game scores [[gfA, gfB], ...] — used for goal differential. */
  games?: [number, number][];
  status: "pending" | "reported";
};

export type FnfStanding = {
  teamId: string;
  seed: number;
  name: string;
  played: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  byes: number;
  gameWins: number;
  gameLosses: number;
  gameDiff: number;
  buchholz: number;
  opponents: string[];
};

// Swiss 3-1-0 scoring: a series win (e.g. 2-0) is worth 3, a 1-1 draw 1 each.
const WIN_POINTS = 3;
const DRAW_POINTS = 1;

/**
 * Build rank-balanced 2v2 teams. Players are sorted by rank weight (best
 * first); the strongest player anchors team 1 and is paired with the weakest
 * available player, the 2nd strongest anchors team 2 with the 2nd weakest, and
 * so on — so the lowest-seeded teams end up the most internally balanced
 * (e.g. two mid players together). With an odd headcount the single middle
 * player lands on the bench for an admin to place by hand.
 */
export function balancedTeams(players: FnfPlayer[]): {
  teams: string[][];
  bench: string[];
} {
  const sorted = [...players].sort((a, b) => b.weight - a.weight);
  const n = sorted.length;
  const k = Math.floor(n / 2);
  const teams: string[][] = [];
  for (let i = 0; i < k; i += 1) {
    teams.push([sorted[i].id, sorted[n - 1 - i].id]);
  }
  const bench = n % 2 === 1 ? [sorted[k].id] : [];
  return { teams, bench };
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** Compute Swiss standings from the reported matches so far. */
export function computeStandings(
  teams: FnfTeamLite[],
  matches: FnfMatchLite[],
): FnfStanding[] {
  const table = new Map<string, FnfStanding>();
  for (const t of teams) {
    table.set(t.id, {
      teamId: t.id,
      seed: t.seed,
      name: t.name,
      played: 0,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      byes: 0,
      gameWins: 0,
      gameLosses: 0,
      gameDiff: 0,
      buchholz: 0,
      opponents: [],
    });
  }

  for (const m of matches) {
    if (m.stage !== "swiss" || m.status !== "reported") continue;
    const a = m.teamAId ? table.get(m.teamAId) : undefined;
    if (!a) continue;
    if (!m.teamBId) {
      // Bye — a free series win: 3 points, no game stats / opponent.
      a.wins += 1;
      a.byes += 1;
      a.points += WIN_POINTS;
      continue;
    }
    const b = table.get(m.teamBId);
    if (!b) continue;
    const sa = m.scoreA ?? 0; // games won by A (series result)
    const sb = m.scoreB ?? 0; // games won by B
    a.played += 1;
    b.played += 1;
    // Goal differential: total goals across every game of the series.
    let goalsA = 0;
    let goalsB = 0;
    for (const g of m.games ?? []) {
      goalsA += g[0] ?? 0;
      goalsB += g[1] ?? 0;
    }
    a.gameWins += goalsA;
    a.gameLosses += goalsB;
    b.gameWins += goalsB;
    b.gameLosses += goalsA;
    a.opponents.push(b.teamId);
    b.opponents.push(a.teamId);
    if (sa === sb) {
      // 1-1 draw: a point each, no win/loss.
      a.draws += 1;
      b.draws += 1;
      a.points += DRAW_POINTS;
      b.points += DRAW_POINTS;
    } else if (sa > sb) {
      a.wins += 1;
      b.losses += 1;
      a.points += WIN_POINTS;
    } else {
      b.wins += 1;
      a.losses += 1;
      b.points += WIN_POINTS;
    }
  }

  for (const s of table.values()) {
    s.gameDiff = s.gameWins - s.gameLosses;
  }
  // Buchholz = sum of opponents' points (strength of schedule tiebreak).
  for (const s of table.values()) {
    s.buchholz = s.opponents.reduce(
      (sum, oppId) => sum + (table.get(oppId)?.points ?? 0),
      0,
    );
  }

  return [...table.values()];
}

/** Order standings best-first for display and pairing — by points, then game
 *  differential, then strength of schedule, then seed. */
export function orderStandings(standings: FnfStanding[]): FnfStanding[] {
  return [...standings].sort(
    (a, b) =>
      b.points - a.points ||
      b.gameDiff - a.gameDiff ||
      b.buchholz - a.buchholz ||
      a.seed - b.seed,
  );
}

/**
 * Recursively pair an ordered id list so no two teams that already met play
 * again, preferring the nearest-ranked legal partner. Returns null when a
 * rematch-free pairing is impossible. Team counts are tiny, so the worst-case
 * backtracking cost is irrelevant.
 */
function pairRematchFree(
  ids: string[],
  played: Set<string>,
): { teamA: string; teamB: string }[] | null {
  if (ids.length === 0) return [];
  const [first, ...rest] = ids;
  for (let j = 0; j < rest.length; j += 1) {
    if (played.has(pairKey(first, rest[j]))) continue;
    const remaining = rest.filter((_, k) => k !== j);
    const sub = pairRematchFree(remaining, played);
    if (sub) return [{ teamA: first, teamB: rest[j] }, ...sub];
  }
  return null;
}

/**
 * Generate the next Swiss round. Teams are taken in current standings order;
 * each is paired with the nearest-ranked team it hasn't already played
 * (backtracking to keep the whole round rematch-free when possible). With an
 * odd count the lowest-standing team that hasn't had a bye gets one
 * (auto-win). `teamB === null` marks the bye.
 */
export function swissPair(
  ordered: FnfStanding[],
  played: Set<string>,
): { teamA: string; teamB: string | null }[] {
  const teams = [...ordered];
  const matches: { teamA: string; teamB: string | null }[] = [];

  if (teams.length % 2 === 1) {
    let idx = -1;
    for (let i = teams.length - 1; i >= 0; i -= 1) {
      if (teams[i].byes === 0) {
        idx = i;
        break;
      }
    }
    if (idx === -1) idx = teams.length - 1;
    const [bye] = teams.splice(idx, 1);
    matches.push({ teamA: bye.teamId, teamB: null });
  }

  const ids = teams.map((t) => t.teamId);
  const rematchFree = pairRematchFree(ids, played);
  if (rematchFree) {
    matches.push(...rematchFree);
    return matches;
  }

  // No rematch-free pairing exists — fall back to adjacent pairing in
  // standings order, accepting the unavoidable rematch(es).
  for (let i = 0; i + 1 < ids.length; i += 2) {
    matches.push({ teamA: ids[i], teamB: ids[i + 1] });
  }
  return matches;
}

/** Set of "already played each other" keys, for rematch avoidance. */
export function playedPairs(matches: FnfMatchLite[]): Set<string> {
  const set = new Set<string>();
  for (const m of matches) {
    if (m.stage === "swiss" && m.teamAId && m.teamBId) {
      set.add(pairKey(m.teamAId, m.teamBId));
    }
  }
  return set;
}

export type BracketMatch = {
  id: string;
  round: number;
  slot: number;
  teamAId: string | null;
  teamBId: string | null;
  nextMatchId: string | null;
  nextSlotIsA: boolean | null;
};

function nextPow2(n: number): number {
  let size = 1;
  while (size < n) size *= 2;
  return size;
}

/** Classic single-elim seeding order (1 vs lowest, etc.) for a bracket of `size`. */
function seedOrder(size: number): number[] {
  let positions = [1, 2];
  while (positions.length < size) {
    const sum = positions.length * 2 + 1;
    const out: number[] = [];
    for (const p of positions) {
      out.push(p);
      out.push(sum - p);
    }
    positions = out;
  }
  return positions;
}

/**
 * Build a full single-elimination bracket from a seeded list of team ids
 * (index 0 = top seed). Pads up to the next power of two with byes given to
 * the top seeds. Returns every match with its winner-advances links so the
 * report RPC can flow winners forward.
 */
export function buildBracket(
  seeds: string[],
  genId: () => string,
): BracketMatch[] {
  const n = seeds.length;
  if (n < 2) return [];
  const size = nextPow2(n);
  const totalRounds = Math.round(Math.log2(size));
  const order = seedOrder(size);

  // Pre-allocate ids per round so we can wire up next_match_id forward.
  const ids: string[][] = [];
  for (let r = 1; r <= totalRounds; r += 1) {
    const cnt = size / 2 ** r;
    ids.push(Array.from({ length: cnt }, () => genId()));
  }

  const matches: BracketMatch[] = [];

  // Round 1 — seed the entrants.
  const r1 = size / 2;
  for (let s = 0; s < r1; s += 1) {
    const seedA = order[2 * s];
    const seedB = order[2 * s + 1];
    const teamA = seedA <= n ? seeds[seedA - 1] : null;
    const teamB = seedB <= n ? seeds[seedB - 1] : null;
    matches.push({
      id: ids[0][s],
      round: 1,
      slot: s,
      teamAId: teamA,
      teamBId: teamB,
      nextMatchId: totalRounds > 1 ? ids[1][Math.floor(s / 2)] : null,
      nextSlotIsA: totalRounds > 1 ? s % 2 === 0 : null,
    });
  }

  // Later rounds — empty until winners arrive.
  for (let r = 2; r <= totalRounds; r += 1) {
    const cnt = size / 2 ** r;
    for (let s = 0; s < cnt; s += 1) {
      matches.push({
        id: ids[r - 1][s],
        round: r,
        slot: s,
        teamAId: null,
        teamBId: null,
        nextMatchId: r < totalRounds ? ids[r][Math.floor(s / 2)] : null,
        nextSlotIsA: r < totalRounds ? s % 2 === 0 : null,
      });
    }
  }

  return matches;
}
