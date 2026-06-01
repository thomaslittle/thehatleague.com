import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { RankBadge } from "@/components/ranks/rank-badge";
import { TwitchIcon } from "@/components/icons/brand";
import { SITE } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadMatch, loadSchedule } from "@/lib/data/tournament";
import { getActiveSeason } from "@/lib/data/season";
import { loadAssets } from "@/lib/data/assets";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { PredictionBox, ReportResultForm, MvpVote } from "@/components/tournament/match-actions";
import { AssetGallery } from "@/components/assets/asset-gallery";
import { AssetSubmit } from "@/components/assets/asset-submit";

interface RosterMember {
  id: string;
  name: string;
  username: string | null;
  peakRank: string | null;
  isCaptain: boolean;
}

export default async function MatchPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const data = await loadMatch(id);
  if (!data) notFound();
  const { match, games } = data;
  const supabase = await createSupabaseServerClient();

  const homeId = match.home?.id ?? null;
  const awayId = match.away?.id ?? null;

  // Rosters for both teams.
  const teamIds = [homeId, awayId].filter((x): x is string => Boolean(x));
  const rosterByTeam = new Map<string, RosterMember[]>();
  if (teamIds.length) {
    const { data: members } = await supabase
      .from("team_members")
      .select(
        "team_id, is_captain, overall_pick, profiles:profile_id(id, discord_username, discord_global_name, peak_rank)",
      )
      .in("team_id", teamIds)
      .order("is_captain", { ascending: false });
    type Row = {
      team_id: string;
      is_captain: boolean;
      profiles: {
        id: string;
        discord_username: string | null;
        discord_global_name: string | null;
        peak_rank: string | null;
      } | null;
    };
    for (const m of (members ?? []) as unknown as Row[]) {
      if (!m.profiles) continue;
      if (!rosterByTeam.has(m.team_id)) rosterByTeam.set(m.team_id, []);
      rosterByTeam.get(m.team_id)!.push({
        id: m.profiles.id,
        name: m.profiles.discord_global_name ?? m.profiles.discord_username ?? "Player",
        username: m.profiles.discord_username,
        peakRank: m.profiles.peak_rank,
        isCaptain: m.is_captain,
      });
    }
  }

  // Predictions tally + viewer involvement.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: preds } = await supabase
    .from("match_predictions")
    .select("predicted_winner_team_id, profile_id")
    .eq("match_id", id);
  let homeVotes = 0;
  let awayVotes = 0;
  let myPick: string | null = null;
  for (const p of preds ?? []) {
    if (p.predicted_winner_team_id === homeId) homeVotes += 1;
    else if (p.predicted_winner_team_id === awayId) awayVotes += 1;
    if (user && p.profile_id === user.id) myPick = p.predicted_winner_team_id;
  }

  let isInvolved = false;
  let canModerate = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
    canModerate = Boolean(profile?.is_admin);
    const { data: caps } = await supabase
      .from("teams")
      .select("captain_id")
      .in("id", teamIds.length ? teamIds : ["00000000-0000-0000-0000-000000000000"]);
    isInvolved = canModerate || (caps ?? []).some((t) => t.captain_id === user.id);
  }

  const isFinal = match.status === "final";
  const homeWon = match.winnerTeamId === homeId;

  // Captain matchup (preview): each team's captain from the rosters.
  const homeCaptain = homeId ? rosterByTeam.get(homeId)?.find((m) => m.isCaptain) ?? null : null;
  const awayCaptain = awayId ? rosterByTeam.get(awayId)?.find((m) => m.isCaptain) ?? null : null;

  // Head-to-head: prior finals between these two teams.
  let h2hHome = 0;
  let h2hAway = 0;
  if (homeId && awayId) {
    const season = await getActiveSeason();
    if (season) {
      const schedule = await loadSchedule(season.id);
      for (const m of schedule) {
        if (m.id === id || m.status !== "final") continue;
        const pair =
          (m.home?.id === homeId && m.away?.id === awayId) ||
          (m.home?.id === awayId && m.away?.id === homeId);
        if (!pair) continue;
        if (m.winnerTeamId === homeId) h2hHome += 1;
        else if (m.winnerTeamId === awayId) h2hAway += 1;
      }
    }
  }
  const hasH2h = h2hHome + h2hAway > 0;

  // MVP votes (final matches): tally + this viewer's pick + votable roster.
  const mvpTally: Record<string, number> = {};
  let myMvpVote: string | null = null;
  const votablePlayers: { id: string; name: string; teamName: string }[] = [];
  if (isFinal) {
    const { data: mvpVotes } = await supabase
      .from("mvp_votes")
      .select("profile_id, voter_id")
      .eq("match_id", id);
    for (const v of mvpVotes ?? []) {
      mvpTally[v.profile_id] = (mvpTally[v.profile_id] ?? 0) + 1;
      if (user && v.voter_id === user.id) myMvpVote = v.profile_id;
    }
    for (const tid of teamIds) {
      const teamName = (tid === homeId ? match.home?.name : match.away?.name) ?? "—";
      for (const m of rosterByTeam.get(tid) ?? []) {
        votablePlayers.push({ id: m.id, name: m.name, teamName });
      }
    }
  }

  // Highlights: clips/assets attached to this match and its individual games.
  const viewerId = user?.id ?? null;
  const [matchAssets, perGameAssets] = await Promise.all([
    loadAssets("match", id, viewerId),
    Promise.all(games.map((g) => loadAssets("game", g.id, viewerId))),
  ]);
  const gameAssetsById = new Map(games.map((g, i) => [g.id, perGameAssets[i]]));
  const hasAnyGameAssets = perGameAssets.some((a) => a.length > 0);

  // Per-player box score + top performer for a final match.
  interface BoxRow {
    profileId: string;
    name: string;
    username: string | null;
    teamId: string | null;
    goals: number;
    assists: number;
    saves: number;
    demos: number;
    score: number;
  }
  let boxScore: BoxRow[] = [];
  let topPerformer: { name: string; score: number } | null = null;
  if (isFinal) {
    // profile → team lookup from the rosters we already loaded.
    const teamOf = new Map<string, string>();
    for (const [tid, members] of rosterByTeam) for (const m of members) teamOf.set(m.id, tid);

    type StatRow = {
      profile_id: string;
      goals: number;
      assists: number;
      saves: number;
      demos: number;
      score: number;
      profiles: { discord_global_name: string | null; discord_username: string | null } | null;
    };
    const { data: stats } = await supabase
      .from("player_stats")
      .select("profile_id, goals, assists, saves, demos, score, profiles:profile_id(discord_global_name, discord_username)")
      .eq("match_id", id)
      .order("score", { ascending: false });
    boxScore = ((stats ?? []) as unknown as StatRow[]).map((s) => ({
      profileId: s.profile_id,
      name: s.profiles?.discord_global_name ?? s.profiles?.discord_username ?? "Player",
      username: s.profiles?.discord_username ?? null,
      teamId: teamOf.get(s.profile_id) ?? null,
      goals: s.goals,
      assists: s.assists,
      saves: s.saves,
      demos: s.demos,
      score: s.score,
    }));
    if (boxScore[0]) topPerformer = { name: boxScore[0].name, score: boxScore[0].score };
  }

  return (
    <PageShell>
      <RealtimeRefresh tables={["matches", "match_games", "match_predictions", "assets"]} channel={`match:${id}`} />

      <section className="mx-auto max-w-[1100px] px-6 pt-12 md:px-10">
        <Link href="/schedule" className="text-sm font-semibold text-thl-orange underline-offset-4 hover:underline">
          ← Schedule
        </Link>
        <div className="mt-4 text-xs font-bold tracking-[0.22em] text-neutral-500 uppercase">
          {match.conference ?? "League"}
          {match.week ? ` · Week ${match.week}` : ""} · {isFinal ? "Final" : match.status}
        </div>

        <div className="mt-5 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <TeamHead name={match.home?.name ?? "TBD"} color={match.home?.color ?? null} won={isFinal && homeWon} align="right" />
          <div className="text-center">
            {isFinal ? (
              <div className="text-5xl font-extrabold tracking-tight tabular-nums">
                <span className={homeWon ? "text-thl-orange" : "text-neutral-400"}>{match.homeScore}</span>
                <span className="mx-2 text-neutral-300">·</span>
                <span className={!homeWon ? "text-thl-orange" : "text-neutral-400"}>{match.awayScore}</span>
              </div>
            ) : (
              <div className="text-2xl font-bold text-neutral-400">vs</div>
            )}
          </div>
          <TeamHead name={match.away?.name ?? "TBD"} color={match.away?.color ?? null} won={isFinal && !homeWon} align="left" />
        </div>

        {!isFinal && (
          <div className="mt-6 flex justify-center">
            <a
              href={SITE.twitchUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-xl bg-[#9146ff] px-5 py-3 font-bold text-white transition hover:bg-[#7c2bff]"
            >
              <TwitchIcon className="h-5 w-5" />
              Watch live
            </a>
          </div>
        )}

        {isFinal && topPerformer && (
          <div className="mt-6 rounded-2xl border border-thl-orange/40 bg-thl-orange/5 p-4 text-center">
            <span className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">Top performer</span>
            <div className="mt-1 text-2xl font-bold tracking-tight">{topPerformer.name}</div>
            <div className="text-sm text-neutral-500">{topPerformer.score} pts</div>
          </div>
        )}

        {!isFinal && (homeCaptain || awayCaptain) && (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="text-center text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Captain matchup
            </div>
            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <CaptainSide member={homeCaptain} align="right" />
              <span className="text-lg font-bold text-neutral-300">vs</span>
              <CaptainSide member={awayCaptain} align="left" />
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto mt-10 grid max-w-[1100px] gap-6 px-6 md:px-10 lg:grid-cols-2">
        {homeId && <RosterCol title={match.home?.name ?? "Home"} members={rosterByTeam.get(homeId) ?? []} />}
        {awayId && <RosterCol title={match.away?.name ?? "Away"} members={rosterByTeam.get(awayId) ?? []} />}
      </section>

      <section className="mx-auto mt-6 grid max-w-[1100px] gap-6 px-6 pb-24 md:px-10 lg:grid-cols-2">
        {match.home && match.away && (
          <PredictionBox
            matchId={id}
            home={{ id: match.home.id, name: match.home.name }}
            away={{ id: match.away.id, name: match.away.name }}
            homeVotes={homeVotes}
            awayVotes={awayVotes}
            myPick={myPick}
            canPredict={Boolean(user) && !isFinal}
          />
        )}

        {hasH2h && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Head-to-head
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="truncate text-sm font-bold">{match.home?.name}</span>
              <span className="text-2xl font-bold tabular-nums">
                <span className={h2hHome >= h2hAway ? "text-thl-orange" : "text-neutral-400"}>{h2hHome}</span>
                <span className="mx-2 text-neutral-300">–</span>
                <span className={h2hAway >= h2hHome ? "text-thl-orange" : "text-neutral-400"}>{h2hAway}</span>
              </span>
              <span className="truncate text-right text-sm font-bold">{match.away?.name}</span>
            </div>
          </div>
        )}

        {isFinal && games.length > 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">Box score</div>
            <table className="mt-3 w-full text-sm">
              <tbody>
                {games.map((g) => (
                  <tr key={g.gameNumber} className="border-b border-neutral-100 last:border-0 dark:border-neutral-900">
                    <td className="py-1.5 text-neutral-400">G{g.gameNumber}</td>
                    <td className="py-1.5 text-right font-bold tabular-nums">{g.homeGoals}</td>
                    <td className="px-2 text-center text-neutral-300">–</td>
                    <td className="py-1.5 font-bold tabular-nums">{g.awayGoals}</td>
                    <td className="py-1.5 text-right">
                      {g.replayUrl && (
                        <a href={g.replayUrl} target="_blank" rel="noopener" className="text-xs text-thl-orange hover:underline">
                          replay ↗
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isFinal && votablePlayers.length > 0 && (
          <MvpVote
            matchId={id}
            players={votablePlayers}
            tally={mvpTally}
            myVote={myMvpVote}
            canVote={Boolean(user)}
          />
        )}

        {isInvolved && match.home && match.away && (
          <ReportResultForm
            matchId={id}
            home={{ id: match.home.id, name: match.home.name }}
            away={{ id: match.away.id, name: match.away.name }}
            bestOf={match.bestOf}
          />
        )}
      </section>

      {boxScore.length > 0 && (
        <section className="mx-auto max-w-[1100px] px-6 pb-10 md:px-10">
          <h2 className="text-xl font-bold tracking-tight">Box score</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-[10px] font-bold tracking-[0.16em] text-neutral-500 uppercase dark:border-neutral-800">
                  <th className="px-4 py-2">Player</th>
                  <th className="px-2 py-2 text-center">G</th>
                  <th className="px-2 py-2 text-center">A</th>
                  <th className="px-2 py-2 text-center">SV</th>
                  <th className="px-2 py-2 text-center">DEM</th>
                  <th className="px-4 py-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {boxScore.map((r, i) => {
                  const teamColor = r.teamId === homeId ? match.home?.color : match.away?.color;
                  return (
                    <tr key={r.profileId} className="border-b border-neutral-100 last:border-0 dark:border-neutral-900">
                      <td className="px-4 py-2">
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: teamColor ?? "var(--color-thl-orange)" }}
                          />
                          {r.username ? (
                            <Link href={`/players/${encodeURIComponent(r.username)}`} className="font-semibold hover:text-thl-orange">
                              {r.name}
                            </Link>
                          ) : (
                            <span className="font-semibold">{r.name}</span>
                          )}
                          {i === 0 && (
                            <span className="rounded bg-thl-orange/15 px-1 text-[9px] font-bold text-thl-orange uppercase">
                              Top
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center tabular-nums">{r.goals}</td>
                      <td className="px-2 py-2 text-center tabular-nums">{r.assists}</td>
                      <td className="px-2 py-2 text-center tabular-nums">{r.saves}</td>
                      <td className="px-2 py-2 text-center tabular-nums">{r.demos}</td>
                      <td className="px-4 py-2 text-right font-bold text-thl-orange tabular-nums">{r.score}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(matchAssets.length > 0 || hasAnyGameAssets || user) && (
        <section className="mx-auto max-w-[1100px] px-6 pb-24 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight">Highlights</h2>
            {user && <AssetSubmit targetType="match" targetId={id} />}
          </div>
          {matchAssets.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">No highlights yet — be the first to add one.</p>
          ) : (
            <div className="mt-4">
              <AssetGallery assets={matchAssets} canModerate={canModerate} />
            </div>
          )}

          {games.length > 0 && (matchAssets.length > 0 || hasAnyGameAssets || user) && (
            <div className="mt-10 space-y-6">
              <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
                Per-game clips
              </div>
              {games.map((g) => {
                const ga = gameAssetsById.get(g.id) ?? [];
                if (ga.length === 0 && !user) return null;
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold tracking-tight">Game {g.gameNumber}</h3>
                      {user && <AssetSubmit targetType="game" targetId={g.id} label="Add" />}
                    </div>
                    {ga.length > 0 ? (
                      <div className="mt-3">
                        <AssetGallery assets={ga} canModerate={canModerate} />
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-neutral-400">No clips for this game yet.</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </PageShell>
  );
}

function TeamHead({
  name,
  color,
  won,
  align,
}: {
  name: string;
  color: string | null;
  won: boolean;
  align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div className="flex items-center gap-3" style={{ flexDirection: align === "right" ? "row-reverse" : "row" }}>
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
          style={{ background: color ?? "var(--color-thl-orange)" }}
        >
          {name.slice(0, 1)}
        </span>
        <span className={`text-2xl font-bold tracking-tight md:text-3xl ${won ? "text-thl-orange" : ""}`}>{name}</span>
      </div>
    </div>
  );
}

function CaptainSide({ member, align }: { member: RosterMember | null; align: "left" | "right" }) {
  if (!member) {
    return <div className={align === "right" ? "text-right text-sm text-neutral-400" : "text-sm text-neutral-400"}>TBD</div>;
  }
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div className="text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase">Captain</div>
      <div className="text-xl font-bold tracking-tight">
        {member.username ? (
          <Link href={`/players/${encodeURIComponent(member.username)}`} className="hover:text-thl-orange">
            {member.name}
          </Link>
        ) : (
          member.name
        )}
      </div>
      <div className="mt-1 flex" style={{ justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
        <RankBadge value={member.peakRank} size={16} abbreviate textClassName="text-xs font-bold" />
      </div>
    </div>
  );
}

function RosterCol({ title, members }: { title: string; members: RosterMember[] }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
      <h3 className="text-lg font-bold tracking-tight">{title}</h3>
      <ul className="mt-3 space-y-1.5">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-2">
            {m.isCaptain && (
              <span className="rounded bg-thl-orange/15 px-1 text-[9px] font-bold text-thl-orange uppercase">C</span>
            )}
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">
              {m.username ? (
                <Link href={`/players/${encodeURIComponent(m.username)}`} className="hover:text-thl-orange">
                  {m.name}
                </Link>
              ) : (
                m.name
              )}
            </span>
            <RankBadge value={m.peakRank} size={16} abbreviate textClassName="text-xs font-bold" />
          </li>
        ))}
        {members.length === 0 && <li className="text-sm text-neutral-500">Roster TBD.</li>}
      </ul>
    </div>
  );
}
