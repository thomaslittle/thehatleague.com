// Idempotent awards engine. Evaluates badge criteria + points from match and
// season data and writes them. Safe to re-run: badges dedupe on
// (profile, badge, season) and points on the dedup index. Call from the result
// path (reportMatchResult) and the mock simulator.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { awardPoints, POINT_VALUES } from "@/lib/awards/points";

type Client = SupabaseClient<Database>;

/** Award a badge by slug (idempotent). Resolves the badge id once. */
export async function awardBadge(
  supabase: Client,
  input: { profileId: string; badgeSlug: string; seasonId: string | null; context?: Record<string, unknown> },
): Promise<void> {
  const { data: badge } = await supabase
    .from("badges")
    .select("id")
    .eq("slug", input.badgeSlug)
    .maybeSingle();
  if (!badge) return;
  await supabase.from("player_badges").upsert(
    {
      profile_id: input.profileId,
      badge_id: badge.id,
      season_id: input.seasonId,
      context: (input.context ?? {}) as Database["public"]["Tables"]["player_badges"]["Insert"]["context"],
    },
    { onConflict: "profile_id,badge_id,season_id", ignoreDuplicates: true },
  );
  // Bonus points for earning a badge.
  await awardPoints(supabase, {
    profileId: input.profileId,
    seasonId: input.seasonId,
    source: "badge",
    points: POINT_VALUES.badge,
    refType: "badge",
    refId: `${input.badgeSlug}:${input.seasonId ?? "all"}`,
  });
}

/**
 * Evaluate everything that hangs off a single final match: participation +
 * result points, per-stat points, performance badges, and MVP. Idempotent.
 */
export async function evaluateMatchAwards(supabase: Client, matchId: string): Promise<void> {
  const { data: match } = await supabase
    .from("matches")
    .select("id, season_id, status, winner_team_id, home_team_id, away_team_id")
    .eq("id", matchId)
    .maybeSingle();
  if (!match || match.status !== "final") return;
  const seasonId = match.season_id;

  // Rosters of both teams.
  const { data: members } = await supabase
    .from("team_members")
    .select("team_id, profile_id")
    .eq("season_id", seasonId)
    .in("team_id", [match.home_team_id, match.away_team_id]);

  for (const m of members ?? []) {
    await awardPoints(supabase, {
      profileId: m.profile_id,
      seasonId,
      source: "match_played",
      points: POINT_VALUES.matchPlayed,
      refType: "match",
      refId: matchId,
    });
    if (m.team_id === match.winner_team_id) {
      await awardPoints(supabase, {
        profileId: m.profile_id,
        seasonId,
        source: "match_win",
        points: POINT_VALUES.matchWin,
        refType: "match",
        refId: matchId,
      });
      await awardBadge(supabase, { profileId: m.profile_id, badgeSlug: "first-win", seasonId });
    }
  }

  // Per-stat points + performance badges.
  const { data: stats } = await supabase
    .from("player_stats")
    .select("profile_id, goals, assists, saves, demos")
    .eq("match_id", matchId);
  for (const s of stats ?? []) {
    const pts =
      s.goals * POINT_VALUES.goal +
      s.assists * POINT_VALUES.assist +
      s.saves * POINT_VALUES.save +
      s.demos * POINT_VALUES.demo;
    await awardPoints(supabase, {
      profileId: s.profile_id,
      seasonId,
      source: "match_stats",
      points: pts,
      refType: "match",
      refId: matchId,
    });
    if (s.goals >= 3) await awardBadge(supabase, { profileId: s.profile_id, badgeSlug: "hat-trick", seasonId });
    if (s.assists >= 3) await awardBadge(supabase, { profileId: s.profile_id, badgeSlug: "playmaker", seasonId });
    if (s.saves >= 5) await awardBadge(supabase, { profileId: s.profile_id, badgeSlug: "the-wall", seasonId });
  }

  // MVP = most votes for this match.
  const { data: votes } = await supabase.from("mvp_votes").select("profile_id").eq("match_id", matchId);
  if (votes?.length) {
    const tally = new Map<string, number>();
    for (const v of votes) tally.set(v.profile_id, (tally.get(v.profile_id) ?? 0) + 1);
    const top = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    if (top) {
      await awardBadge(supabase, { profileId: top, badgeSlug: "match-mvp", seasonId });
      await awardPoints(supabase, {
        profileId: top,
        seasonId,
        source: "mvp",
        points: POINT_VALUES.mvp,
        refType: "match",
        refId: matchId,
      });
    }
  }
}

/**
 * Season-wide passes: "drafted" for every drafted player, "sharpshooter" for
 * 20+ season goals, and (optionally) "champion" for the standings leader.
 */
export async function evaluateSeasonAwards(
  supabase: Client,
  seasonId: string,
  opts: { crownChampion?: boolean } = {},
): Promise<void> {
  // Drafted badge for everyone who was picked (overall_pick set).
  const { data: drafted } = await supabase
    .from("team_members")
    .select("profile_id, overall_pick")
    .eq("season_id", seasonId)
    .not("overall_pick", "is", null);
  for (const d of drafted ?? []) {
    await awardBadge(supabase, { profileId: d.profile_id, badgeSlug: "drafted", seasonId });
  }

  // Sharpshooter: 20+ season goals.
  const { data: seasonStats } = await supabase
    .from("player_season_stats")
    .select("profile_id, goals")
    .eq("season_id", seasonId);
  for (const s of seasonStats ?? []) {
    if (s.profile_id && Number(s.goals ?? 0) >= 20) {
      await awardBadge(supabase, { profileId: s.profile_id, badgeSlug: "sharpshooter", seasonId });
    }
  }

  // Champion: standings leader's roster.
  if (opts.crownChampion) {
    const { data: standings } = await supabase
      .from("standings_view")
      .select("team_id, w, diff")
      .eq("season_id", seasonId);
    const top = [...(standings ?? [])].sort(
      (a, b) => Number(b.w ?? 0) - Number(a.w ?? 0) || Number(b.diff ?? 0) - Number(a.diff ?? 0),
    )[0];
    if (top?.team_id) {
      const { data: champRoster } = await supabase
        .from("team_members")
        .select("profile_id")
        .eq("season_id", seasonId)
        .eq("team_id", top.team_id);
      for (const m of champRoster ?? []) {
        await awardBadge(supabase, { profileId: m.profile_id, badgeSlug: "champion", seasonId });
        await awardPoints(supabase, {
          profileId: m.profile_id,
          seasonId,
          source: "champion",
          points: POINT_VALUES.champion,
          refType: "season",
          refId: seasonId,
        });
      }
    }
  }
}
