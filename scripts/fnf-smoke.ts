/*
 * Friday Nite Fights end-to-end smoke test.
 *
 * Exercises the REAL SECURITY DEFINER RPCs on the database plus the TS
 * pairing/standings/bracket logic through full mock tournaments, asserting the
 * tricky bits: the Swiss 2-game points format (3-1-0), 1-1 draws, byes,
 * rematch avoidance, playoff best-of per round, and the guard rails (no playoff
 * ties, no reporting a bye, no silent re-report after a round advances).
 *
 * Each run creates its OWN throwaway tournaments (name starts with
 * "MOCK FNF SMOKE") and deletes only those — the real tournament and every
 * profile are left untouched.
 *
 * Usage:
 *   FNF_SMOKE_DB_URL="postgres://user:pass@host:5436/postgres" \
 *     npx tsx scripts/fnf-smoke.ts
 */
import { Client } from "pg";
import { rankWeight } from "../lib/data/rank-sort";
import {
  balancedTeams,
  buildBracket,
  computeStandings,
  orderStandings,
  playedPairs,
  swissPair,
  type FnfMatchLite,
} from "../lib/fnf/pairing";

const CONN = process.env.FNF_SMOKE_DB_URL;
if (!CONN) {
  console.error(
    "Set FNF_SMOKE_DB_URL to a Postgres connection string (a DB superuser /\n" +
      "owner role, so the test can impersonate an admin via request.jwt.claims).",
  );
  process.exit(2);
}

let failures = 0;
function check(label: string, cond: boolean, detail = "") {
  if (!cond) failures += 1;
  console.log(`    ${cond ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
}

// Turn a desired (games-won-by-a, games-won-by-b) into per-game scores the
// new fnf_report_match RPC expects: wa games of 1-0, then wb games of 0-1.
function gamesJson(wa: number, wb: number): string {
  const g: [number, number][] = [];
  for (let i = 0; i < wa; i += 1) g.push([1, 0]);
  for (let i = 0; i < wb; i += 1) g.push([0, 1]);
  return JSON.stringify(g);
}

type QueryFn = (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
type AsUser = (id: string) => Promise<unknown>;

type Match = {
  id: string;
  stage: "swiss" | "playoffs";
  round: number;
  slot: number;
  team_a_id: string | null;
  team_b_id: string | null;
  winner_team_id: string | null;
  score_a: number | null;
  score_b: number | null;
  status: "pending" | "reported";
  best_of: number;
};

async function main() {
  const c = new Client({ connectionString: CONN });
  await c.connect();
  const q = (sql: string, params: unknown[] = []) => c.query(sql, params);

  const adminId: string = (
    await q("select id from profiles where is_admin = true limit 1")
  ).rows[0].id;
  const asUser = (id: string) =>
    q("select set_config('request.jwt.claims', $1, false), set_config('request.jwt.claim.sub', $2, false)", [
      JSON.stringify({ sub: id, role: "authenticated" }),
      id,
    ]);
  await asUser(adminId);

  const created: string[] = [];
  try {
    await scenarioEven(q, asUser, adminId, created);
    await scenarioByesAndDraws(q, asUser, adminId, created);
    await scenarioReset(q, adminId, created);
  } finally {
    for (const tid of created) {
      await q("delete from fnf_tournaments where id=$1 and name like 'MOCK FNF SMOKE%'", [tid]);
    }
    if (created.length) console.log(`\nCleaned up ${created.length} throwaway tournament(s).`);
    await c.end();
  }

  console.log(
    failures === 0
      ? "\n✅ ALL CHECKS PASSED — safe to run tonight.\n"
      : `\n❌ ${failures} CHECK(S) FAILED\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

// ---- shared helpers ----

async function setup(
  q: QueryFn,
  adminId: string,
  created: string[],
  opts: { players: number; swissRounds: number; swissGames: number; playoffBo: number; finalBo: number; cut: number },
) {
  const tid = (
    await q("select fnf_upsert_tournament($1,$2,$3,$4,$5,$6,$7,$8) as id", [
      null, "MOCK FNF SMOKE", opts.swissRounds, opts.swissGames, opts.playoffBo, opts.finalBo, opts.cut, null,
    ])
  ).rows[0] as { id: string };
  created.push(tid.id);

  const pool = (
    await q("select id, rank_2v2, peak_rank from profiles where is_mock=false order by created_at limit $1", [opts.players])
  ).rows as { id: string; rank_2v2: string | null; peak_rank: string | null }[];
  const players = pool.map((p) => {
    let w = rankWeight(p.rank_2v2);
    if (w <= 0) w = rankWeight(p.peak_rank);
    return { id: p.id, weight: w };
  });
  for (const p of pool) {
    const pl = players.find((x) => x.id === p.id)!;
    await q("insert into fnf_registrations (tournament_id, profile_id, rank_value, rank_weight) values ($1,$2,$3,$4)",
      [tid.id, p.id, p.rank_2v2 ?? p.peak_rank, pl.weight]);
  }
  const { teams: gen, bench } = balancedTeams(players);
  const payload = gen.map((ids, i) => ({ seed: i + 1, name: `Team ${i + 1}`, profile_ids: ids }));
  if (bench.length) payload.push({ seed: payload.length + 1, name: "Bench", profile_ids: bench });
  await q("select fnf_generate_teams($1,$2::jsonb)", [tid.id, JSON.stringify(payload)]);

  const teamRows = (await q("select id, seed, name from fnf_teams where tournament_id=$1 order by seed", [tid.id]))
    .rows as { id: string; seed: number; name: string }[];
  return { tid: tid.id, teamRows, benchCount: bench.length };
}

const matchesOf = async (
  q: QueryFn,
  tid: string,
) => (await q("select id, stage, round, slot, team_a_id, team_b_id, winner_team_id, score_a, score_b, status, best_of from fnf_matches where tournament_id=$1 order by stage, round, slot", [tid])).rows as Match[];

const lite = (ms: Match[]): FnfMatchLite[] =>
  ms.map((m) => ({ stage: m.stage, round: m.round, teamAId: m.team_a_id, teamBId: m.team_b_id, winnerTeamId: m.winner_team_id, scoreA: m.score_a, scoreB: m.score_b, status: m.status }));

// Play out the whole Swiss stage. `result(m, round)` returns [scoreA, scoreB].
async function playSwiss(
  q: QueryFn,
  tid: string,
  teamLite: { id: string; seed: number; name: string }[],
  swissGames: number,
  result: (m: Match, roundIdx: number) => [number, number],
) {
  // round 1
  const r1 = swissPair(orderStandings(computeStandings(teamLite, [])), new Set());
  await q("select fnf_create_round($1,'swiss',1,$2::jsonb)", [tid,
    JSON.stringify(r1.map((p, i) => ({ slot: i, team_a_id: p.teamA, team_b_id: p.teamB ?? "", best_of: swissGames })))]);

  for (let guard = 0; guard < 200; guard += 1) {
    const tr = (await q("select status, current_round, swiss_rounds from fnf_tournaments where id=$1", [tid])).rows[0] as { status: string; current_round: number; swiss_rounds: number };
    if (tr.status !== "swiss") break;
    const pend = (await matchesOf(q, tid)).filter((m) => m.round === tr.current_round && m.stage === "swiss" && m.team_b_id && m.status !== "reported");
    for (const m of pend) {
      const [sa, sb] = result(m, tr.current_round);
      const res = await q("select fnf_report_match($1,$2::jsonb) as r", [m.id, gamesJson(sa, sb)]);
      if ((((res.rows[0] as { r: { round_complete: boolean } }).r).round_complete)) {
        const t2 = (await q("select current_round, swiss_rounds from fnf_tournaments where id=$1", [tid])).rows[0] as { current_round: number; swiss_rounds: number };
        if (t2.current_round >= t2.swiss_rounds) await q("select fnf_set_status($1,'complete')", [tid]);
        else {
          const cur = lite(await matchesOf(q, tid));
          const pairs = swissPair(orderStandings(computeStandings(teamLite, cur)), playedPairs(cur));
          await q("select fnf_create_round($1,'swiss',$2,$3::jsonb)", [tid, t2.current_round + 1,
            JSON.stringify(pairs.map((p, i) => ({ slot: i, team_a_id: p.teamA, team_b_id: p.teamB ?? "", best_of: swissGames })))]);
        }
      }
    }
  }
}

// ---- scenarios ----

async function scenarioEven(q: QueryFn, asUser: AsUser, adminId: string, created: string[]) {
  console.log("\n[Scenario A] 8 teams · Swiss Bo2 points · playoffs Bo3/Bo5");
  const { tid, teamRows, benchCount } = await setup(q, adminId, created, { players: 16, swissRounds: 4, swissGames: 2, playoffBo: 3, finalBo: 5, cut: 4 });
  const seedOf = new Map(teamRows.map((t) => [t.id, t.seed]));
  const teamLite = teamRows.map((t) => ({ id: t.id, seed: t.seed, name: t.name }));
  check("8 teams, no bench", teamRows.length === 8 && benchCount === 0);

  let decisive = 0, draws = 0;
  await playSwiss(q, tid, teamLite, 2, (m) => {
    // alternate: even slot decisive (2-0), odd slot draw (1-1)
    if (m.slot % 2 === 1) { draws += 1; return [1, 1]; }
    decisive += 1;
    return seedOf.get(m.team_a_id!)! < seedOf.get(m.team_b_id!)! ? [2, 0] : [0, 2];
  });

  const swissMs = (await matchesOf(q, tid)).filter((m) => m.stage === "swiss");
  check("every swiss match is a 2-game series", swissMs.every((m) => m.best_of === 2));
  check("draws have no winner", swissMs.filter((m) => m.score_a === m.score_b).every((m) => m.winner_team_id === null));
  const standings = orderStandings(computeStandings(teamLite, lite(await matchesOf(q, tid))));
  const totalPts = standings.reduce((s, x) => s + x.points, 0);
  check("3-1-0 points total", totalPts === 3 * decisive + 2 * draws, `${totalPts} vs ${3 * decisive + 2 * draws}`);
  check("standings sorted by points desc", standings.every((s, i) => i === 0 || standings[i - 1].points >= s.points));

  // playoffs
  const seeds = standings.slice(0, 4).map((s) => s.teamId);
  let n = 0;
  const bracket = buildBracket(seeds, () => `00000000-0000-4000-8000-${String(n++).padStart(12, "0")}`);
  const finalRound = bracket.reduce((mx, m) => Math.max(mx, m.round), 0);
  await q("select fnf_create_playoffs($1,$2::jsonb)", [tid,
    JSON.stringify(bracket.map((m) => ({ id: m.id, round: m.round, slot: m.slot, team_a_id: m.teamAId ?? "", team_b_id: m.teamBId ?? "", next_match_id: m.nextMatchId ?? "", next_slot_is_a: m.nextSlotIsA, best_of: m.round === finalRound ? 5 : 3 })))]);
  const po = (await matchesOf(q, tid)).filter((m) => m.stage === "playoffs");
  check("SF Bo3, Final Bo5", po.filter((m) => m.round < finalRound).every((m) => m.best_of === 3) && po.filter((m) => m.round === finalRound).every((m) => m.best_of === 5));

  // guard: playoff tie rejected
  const aPo = po.find((m) => m.team_a_id && m.team_b_id)!;
  check("playoff tie rejected", await rejects(q, "select fnf_report_match($1,$2::jsonb)", [aPo.id, gamesJson(1, 1)]));

  // play playoffs
  for (let r = 1; r <= finalRound; r += 1)
    for (const m of (await matchesOf(q, tid)).filter((x) => x.stage === "playoffs" && x.round === r)) {
      if (!m.team_a_id || !m.team_b_id || m.status === "reported") continue;
      const win = Math.ceil(m.best_of / 2);
      const lo = seedOf.get(m.team_a_id)! < seedOf.get(m.team_b_id)!;
      await q("select fnf_report_match($1,$2::jsonb)", [m.id, gamesJson(lo ? win : 0, lo ? 0 : win)]);
    }
  const champ = (await matchesOf(q, tid)).find((m) => m.stage === "playoffs" && m.round === finalRound);
  check("champion crowned", !!champ?.winner_team_id, champ?.winner_team_id ? `Team ${seedOf.get(champ.winner_team_id)}` : "none");
}

async function scenarioByesAndDraws(q: QueryFn, asUser: AsUser, adminId: string, created: string[]) {
  console.log("\n[Scenario B] 9 teams · byes + an all-draw round · guard rails");
  const { tid, teamRows } = await setup(q, adminId, created, { players: 18, swissRounds: 5, swissGames: 2, playoffBo: 3, finalBo: 3, cut: 8 });
  const seedOf = new Map(teamRows.map((t) => [t.id, t.seed]));
  const teamLite = teamRows.map((t) => ({ id: t.id, seed: t.seed, name: t.name }));
  check("9 teams (odd → byes)", teamRows.length === 9);

  await playSwiss(q, tid, teamLite, 2, (m, round) => {
    if (round === 1) return [1, 1]; // round 1: EVERYONE draws
    if (m.slot % 3 === 0) return [1, 1]; // some draws elsewhere too
    return seedOf.get(m.team_a_id!)! < seedOf.get(m.team_b_id!)! ? [2, 0] : [0, 2];
  });

  const ms = await matchesOf(q, tid);
  const swissMs = ms.filter((m) => m.stage === "swiss");
  check("5 rounds played", new Set(swissMs.map((m) => m.round)).size === 5);

  // no rematches
  const seen = new Set<string>();
  let rematches = 0;
  for (const m of swissMs) if (m.team_a_id && m.team_b_id) { const k = [m.team_a_id, m.team_b_id].sort().join("|"); if (seen.has(k)) rematches += 1; seen.add(k); }
  check("no rematches", rematches === 0);

  // byes: one per round, no team gets two
  const byeRows = swissMs.filter((m) => !m.team_b_id);
  const byeCounts = new Map<string, number>();
  for (const b of byeRows) byeCounts.set(b.team_a_id!, (byeCounts.get(b.team_a_id!) ?? 0) + 1);
  check("one bye per round", byeRows.length === 5);
  check("no team gets two byes", [...byeCounts.values()].every((v) => v <= 1));
  check("bye auto-resolves as a reported win", byeRows.every((m) => m.status === "reported" && m.winner_team_id === m.team_a_id));

  // standings: round-1 all-draw means after R1 every non-bye team has 1 pt, bye team 3.
  const afterAll = orderStandings(computeStandings(teamLite, lite(ms)));
  check("a team has draws and points reflect them", afterAll.some((s) => s.draws > 0 && s.points >= s.draws));

  // guard: a bye match can't be reported.
  const bye = byeRows[0];
  check("bye match cannot be reported", await rejects(q, "select fnf_report_match($1,$2::jsonb)", [bye.id, gamesJson(2, 0)]));

  // guard: a non-admin can't re-report an already-reported match.
  const reported = swissMs.find((m) => m.team_b_id && m.status === "reported")!;
  const member = (await q("select profile_id from fnf_team_members where team_id=$1 limit 1", [reported.team_a_id])).rows[0] as { profile_id: string };
  await asUser(member.profile_id);
  check("a participant can fix their own reported score", !(await rejects(q, "select fnf_report_match($1,$2::jsonb)", [reported.id, gamesJson(2, 0)])));
  await asUser(adminId);
  check("admin can also correct a reported match", !(await rejects(q, "select fnf_report_match($1,$2::jsonb)", [reported.id, gamesJson(2, 0)])));

  // playoffs from top 8 of 9
  const seeds = afterAll.slice(0, 8).map((s) => s.teamId);
  let n = 0;
  const bracket = buildBracket(seeds, () => `00000000-0000-4000-8000-${String(100 + n++).padStart(12, "0")}`);
  const finalRound = bracket.reduce((mx, m) => Math.max(mx, m.round), 0);
  await q("select fnf_create_playoffs($1,$2::jsonb)", [tid,
    JSON.stringify(bracket.map((m) => ({ id: m.id, round: m.round, slot: m.slot, team_a_id: m.teamAId ?? "", team_b_id: m.teamBId ?? "", next_match_id: m.nextMatchId ?? "", next_slot_is_a: m.nextSlotIsA, best_of: m.round === finalRound ? 3 : 3 })))]);
  const po = (await matchesOf(q, tid)).filter((m) => m.stage === "playoffs");
  check("8-seed bracket = 7 matches / 3 rounds", po.length === 7 && new Set(po.map((m) => m.round)).size === 3);
  for (let r = 1; r <= finalRound; r += 1)
    for (const m of (await matchesOf(q, tid)).filter((x) => x.stage === "playoffs" && x.round === r)) {
      if (!m.team_a_id || !m.team_b_id || m.status === "reported") continue;
      const win = Math.ceil(m.best_of / 2);
      const lo = seedOf.get(m.team_a_id)! < seedOf.get(m.team_b_id)!;
      await q("select fnf_report_match($1,$2::jsonb)", [m.id, gamesJson(lo ? win : 0, lo ? 0 : win)]);
    }
  const champ = (await matchesOf(q, tid)).find((m) => m.stage === "playoffs" && m.round === finalRound);
  check("champion crowned", !!champ?.winner_team_id);
}

async function scenarioReset(q: QueryFn, adminId: string, created: string[]) {
  console.log("\n[Scenario C] reset / undo from mid-Swiss → re-generate");
  const { tid, teamRows } = await setup(q, adminId, created, { players: 16, swissRounds: 4, swissGames: 2, playoffBo: 3, finalBo: 3, cut: 4 });
  const teamLite = teamRows.map((t) => ({ id: t.id, seed: t.seed, name: t.name }));
  check("teams generated (status=teams)", (await statusOf(q, tid)) === "teams");

  // Start Swiss and report one match so there's real data to wipe.
  const r1 = swissPair(orderStandings(computeStandings(teamLite, [])), new Set());
  await q("select fnf_create_round($1,'swiss',1,$2::jsonb)", [tid,
    JSON.stringify(r1.map((p, i) => ({ slot: i, team_a_id: p.teamA, team_b_id: p.teamB ?? "", best_of: 2 })))]);
  const firstReal = (await matchesOf(q, tid)).find((m) => m.team_b_id)!;
  await q("select fnf_report_match($1,$2::jsonb)", [firstReal.id, gamesJson(2, 0)]);
  check("mid-Swiss state exists", (await statusOf(q, tid)) === "swiss");

  // Reset.
  await q("select fnf_reset($1)", [tid]);
  const count = async (t: string) =>
    Number(((await q(`select count(*)::int n from ${t} where tournament_id=$1`, [tid])).rows[0] as { n: number }).n);
  check("reset reopens registration", (await statusOf(q, tid)) === "registration");
  check("teams + matches + members cleared",
    (await count("fnf_teams")) === 0 && (await count("fnf_matches")) === 0 && (await count("fnf_team_members")) === 0);
  check("signups preserved", (await count("fnf_registrations")) === 16);

  // Re-generate from the kept signups.
  const regs = (await q("select profile_id, rank_weight from fnf_registrations where tournament_id=$1", [tid])).rows as { profile_id: string; rank_weight: number }[];
  const { teams: gen } = balancedTeams(regs.map((r) => ({ id: r.profile_id, weight: r.rank_weight })));
  await q("select fnf_generate_teams($1,$2::jsonb)", [tid,
    JSON.stringify(gen.map((ids, i) => ({ seed: i + 1, name: `Team ${i + 1}`, profile_ids: ids })))]);
  check("re-generate works after reset",
    (await statusOf(q, tid)) === "teams" && (await count("fnf_teams")) === 8);
}

async function statusOf(q: QueryFn, tid: string) {
  return ((await q("select status from fnf_tournaments where id=$1", [tid])).rows[0] as { status: string }).status;
}

async function rejects(q: QueryFn, sql: string, params: unknown[]) {
  try {
    await q(sql, params);
    return false;
  } catch {
    return true;
  }
}

main().catch((e) => {
  console.error("SMOKE TEST CRASHED:", e);
  process.exit(1);
});
