import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeason } from "@/lib/data/season";
import { loadPlayerBadges, loadPlayerPoints, loadRankHistory } from "@/lib/data/awards";
import { loadCareerStats } from "@/lib/data/stats";
import { loadSchedule, type MatchView } from "@/lib/data/tournament";
import { PatchIcon } from "@/components/patches/patch-icon";
import { RankHistoryChart } from "@/components/players/rank-history-chart";

/**
 * Scouting-grade profile block: points, badge case, current-season stat line,
 * draft history, and an auto-generated scouting blurb. Self-contained server
 * component — renders nothing it has no data for, so quiet profiles stay clean.
 */
export async function PlayerScouting({
  profileId,
  username,
}: {
  profileId: string;
  username?: string | null;
}) {
  const season = await getActiveSeason();
  const supabase = await createSupabaseServerClient();

  const [badges, points, rankHistory, career, seasonStats, membership] = await Promise.all([
    loadPlayerBadges(profileId),
    loadPlayerPoints(profileId),
    loadRankHistory(profileId),
    loadCareerStats(profileId),
    season
      ? supabase
          .from("player_season_stats")
          .select("games_played, goals, assists, saves, demos, score")
          .eq("season_id", season.id)
          .eq("profile_id", profileId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    season
      ? supabase
          .from("team_members")
          .select("team_id, overall_pick, round, is_captain, teams:team_id(name, slug)")
          .eq("season_id", season.id)
          .eq("profile_id", profileId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const stats = seasonStats.data;
  const team = membership.data?.teams as unknown as { name: string; slug: string } | null;
  const draft = membership.data;
  const teamId = membership.data?.team_id ?? null;

  // Recent match log for the player's team.
  let matchLog: MatchView[] = [];
  if (season && teamId) {
    const all = await loadSchedule(season.id);
    matchLog = all
      .filter((m) => m.home?.id === teamId || m.away?.id === teamId)
      .filter((m) => m.status === "final")
      .slice(-5)
      .reverse();
  }

  const hasAnything = points > 0 || badges.length > 0 || stats || team || rankHistory.length >= 2;
  if (!hasAnything) return null;

  const gp = Number(stats?.games_played ?? 0);
  const blurb = stats && gp > 0 ? buildScoutingReport(stats, gp) : null;

  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-7 py-5 dark:border-neutral-800">
        <h2 className="text-xl font-bold tracking-tight">Scouting report</h2>
        <div className="flex items-center gap-4">
          {username && (
            <Link
              href={`/compare?a=${encodeURIComponent(username)}`}
              className="text-xs font-bold text-thl-orange underline-offset-4 hover:underline"
            >
              Compare →
            </Link>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
              League points
            </span>
            <span className="text-2xl font-bold text-thl-orange tabular-nums">{points}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-7 md:grid-cols-2">
        <div>
          {team && draft && (
            <div className="mb-5">
              <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
                {season?.name ?? "Season"} draft
              </div>
              <p className="mt-1 text-sm">
                {draft.is_captain ? (
                  <>Captain of </>
                ) : draft.overall_pick ? (
                  <>Pick #{draft.overall_pick} · Round {draft.round} to </>
                ) : (
                  <>Rostered on </>
                )}
                <Link href={`/teams/${team.slug}`} className="font-bold text-thl-orange hover:underline">
                  {team.name}
                </Link>
              </p>
            </div>
          )}

          {stats && gp > 0 ? (
            <>
              <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
                Season stats · {gp} GP
              </div>
              <dl className="mt-2 grid grid-cols-4 gap-2">
                <StatCell label="G" value={stats.goals} />
                <StatCell label="A" value={stats.assists} />
                <StatCell label="SV" value={stats.saves} />
                <StatCell label="DEM" value={stats.demos} />
              </dl>
              {blurb && <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">{blurb}</p>}
            </>
          ) : (
            <p className="text-sm text-neutral-500">No season stats logged yet.</p>
          )}

          {rankHistory.length >= 2 && (
            <div className="mt-5">
              <RankHistoryChart points={rankHistory} />
            </div>
          )}
        </div>

        <div>
          <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
            Patch collection · {badges.length}
          </div>
          {badges.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {badges.map((b) => (
                <li
                  key={b.slug}
                  title={b.description ?? b.name}
                  className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 dark:border-neutral-800"
                >
                  <PatchIcon name={b.icon} className="h-4 w-4 text-thl-orange" />
                  <span className="text-xs font-bold">{b.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">No patches yet — earn them on the pitch.</p>
          )}
        </div>
      </div>

      {career.seasons > 1 && (
        <div className="border-t border-neutral-200 px-7 py-5 dark:border-neutral-800">
          <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
            Career · {career.seasons} seasons · {career.gp} GP
          </div>
          <dl className="mt-2 grid grid-cols-4 gap-2">
            <StatCell label="G" value={career.goals} />
            <StatCell label="A" value={career.assists} />
            <StatCell label="SV" value={career.saves} />
            <StatCell label="DEM" value={career.demos} />
          </dl>
        </div>
      )}

      {matchLog.length > 0 && (
        <div className="border-t border-neutral-200 px-7 py-5 dark:border-neutral-800">
          <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
            Recent matches
          </div>
          <ul className="mt-3 space-y-1.5">
            {matchLog.map((m) => {
              const won = m.winnerTeamId === teamId;
              const isHome = m.home?.id === teamId;
              const opponent = isHome ? m.away : m.home;
              const myScore = isHome ? m.homeScore : m.awayScore;
              const oppScore = isHome ? m.awayScore : m.homeScore;
              return (
                <li key={m.id}>
                  <Link
                    href={`/matches/${m.id}`}
                    className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 text-sm transition hover:border-thl-orange dark:border-neutral-800"
                  >
                    <span className={`w-5 text-center font-bold ${won ? "text-emerald-500" : "text-neutral-400"}`}>
                      {won ? "W" : "L"}
                    </span>
                    <span className="min-w-0 flex-1 truncate">vs {opponent?.name ?? "—"}</span>
                    <span className="font-bold text-thl-orange tabular-nums">
                      {myScore}-{oppScore}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function buildScoutingReport(
  s: { goals: number | null; assists: number | null; saves: number | null; demos: number | null },
  gp: number,
): string {
  const g = Number(s.goals ?? 0) / gp;
  const a = Number(s.assists ?? 0) / gp;
  const sv = Number(s.saves ?? 0) / gp;
  const traits: string[] = [];
  if (g >= 2) traits.push("a high-volume scorer");
  else if (g >= 1) traits.push("a steady finisher");
  if (a >= 1.5) traits.push("a creative playmaker");
  if (sv >= 2.5) traits.push("a reliable last line of defense");
  if (!traits.length) traits.push("a balanced two-way contributor");
  return `Profiles as ${traits.join(", ")} — averaging ${g.toFixed(1)} goals, ${a.toFixed(
    1,
  )} assists and ${sv.toFixed(1)} saves per game this season.`;
}

function StatCell({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-2 py-2 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <div className="text-[9px] font-bold tracking-[0.18em] text-neutral-500 uppercase">{label}</div>
      <div className="mt-0.5 text-xl font-bold tabular-nums">{value ?? 0}</div>
    </div>
  );
}
