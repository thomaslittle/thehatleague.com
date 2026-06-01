// Shared draft data layer. Deliberately NOT `server-only`: the same loader runs
// on the server (initial RSC render) and in the browser (Realtime refetch), so
// it takes a typed Supabase client and stitches the snapshot in JS. Keeping the
// shapes here stops the board, control room, and overlays from drifting.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { DraftType } from "@/lib/draft/order";

export type Client = SupabaseClient<Database>;

export type DraftStatus = "setup" | "live" | "paused" | "complete";

export interface DraftPerson {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  peakRank: string | null;
  rank3v3: string | null;
  rank2v2: string | null;
}

export interface DraftTeam {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  conference: string | null;
  draftPosition: number | null;
  captain: DraftPerson | null;
}

export interface DraftPickView {
  id: string;
  overall: number;
  round: number;
  pickInRound: number;
  teamId: string;
  autoPicked: boolean;
  pickedAt: string;
  player: DraftPerson | null;
}

export interface DraftStateView {
  status: DraftStatus;
  currentOverall: number;
  currentRound: number;
  onClockTeamId: string | null;
  pickEndsAt: string | null;
  isPaused: boolean;
  pausedRemainingMs: number | null;
  lastPickId: string | null;
}

export interface DraftSnapshot {
  seasonId: string;
  state: DraftStateView | null;
  teams: DraftTeam[];
  /** Ordered team ids (position 1 first). */
  order: string[];
  picks: DraftPickView[];
  pickSeconds: number;
  picksPerTeam: number;
  rosterSize: number;
  /** Snake or linear — drives the "up next" / team-at-overall math. */
  draftType: DraftType;
}

function personFromProfile(p: ProfileLite | undefined | null): DraftPerson | null {
  if (!p) return null;
  return {
    id: p.id,
    name: p.discord_global_name ?? p.discord_username ?? "Player",
    username: p.discord_username,
    avatarUrl: p.profile_avatar_url ?? p.discord_avatar_url,
    peakRank: p.peak_rank,
    rank3v3: p.rank_3v3,
    rank2v2: p.rank_2v2,
  };
}

interface ProfileLite {
  id: string;
  discord_username: string | null;
  discord_global_name: string | null;
  discord_avatar_url: string | null;
  profile_avatar_url: string | null;
  peak_rank: string | null;
  rank_3v3: string | null;
  rank_2v2: string | null;
}

const PROFILE_LITE_SELECT =
  "id, discord_username, discord_global_name, discord_avatar_url, profile_avatar_url, peak_rank, rank_3v3, rank_2v2" as const;

interface DraftSettingsShape {
  pick_seconds?: number;
  roster_size?: number;
  captain_is_roster_slot?: boolean;
  type?: string;
}

/** Load everything the board / control room / overlays need for one season. */
export async function loadDraftSnapshot(
  supabase: Client,
  seasonId: string,
): Promise<DraftSnapshot> {
  const [seasonRes, stateRes, teamsRes, orderRes, picksRes] = await Promise.all([
    supabase.from("seasons").select("draft_settings").eq("id", seasonId).maybeSingle(),
    supabase
      .from("draft_state")
      .select(
        "status, current_overall_pick, current_round, on_clock_team_id, pick_ends_at, is_paused, paused_remaining_ms, last_pick_id",
      )
      .eq("season_id", seasonId)
      .maybeSingle(),
    supabase
      .from("teams")
      .select("id, name, slug, color, conference, draft_position, captain_id")
      .eq("season_id", seasonId),
    supabase
      .from("draft_order")
      .select("team_id, position")
      .eq("season_id", seasonId)
      .order("position", { ascending: true }),
    supabase
      .from("draft_picks")
      .select("id, overall_pick, round, pick_in_round, team_id, profile_id, auto_picked, picked_at")
      .eq("season_id", seasonId)
      .order("overall_pick", { ascending: true }),
  ]);

  const settings = (seasonRes.data?.draft_settings ?? {}) as DraftSettingsShape;
  const rosterSize = Number(settings.roster_size) > 0 ? Number(settings.roster_size) : 3;
  const captainSlot =
    typeof settings.captain_is_roster_slot === "boolean" ? settings.captain_is_roster_slot : true;
  const picksPerTeam = Math.max(0, rosterSize - (captainSlot ? 1 : 0));
  const pickSeconds = Number(settings.pick_seconds) > 0 ? Number(settings.pick_seconds) : 60;

  const teamRows = teamsRes.data ?? [];
  const pickRows = picksRes.data ?? [];

  // Fetch every referenced profile (captains + drafted players) in one query.
  const profileIds = new Set<string>();
  for (const t of teamRows) if (t.captain_id) profileIds.add(t.captain_id);
  for (const p of pickRows) profileIds.add(p.profile_id);

  const profileMap = new Map<string, ProfileLite>();
  if (profileIds.size) {
    const { data: profs } = await supabase
      .from("profiles")
      .select(PROFILE_LITE_SELECT)
      .in("id", [...profileIds]);
    for (const p of (profs ?? []) as ProfileLite[]) profileMap.set(p.id, p);
  }

  const teams: DraftTeam[] = teamRows
    .map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      color: t.color,
      conference: t.conference,
      draftPosition: t.draft_position,
      captain: personFromProfile(t.captain_id ? profileMap.get(t.captain_id) : null),
    }))
    .sort((a, b) => (a.draftPosition ?? 999) - (b.draftPosition ?? 999));

  const picks: DraftPickView[] = pickRows.map((p) => ({
    id: p.id,
    overall: p.overall_pick,
    round: p.round,
    pickInRound: p.pick_in_round,
    teamId: p.team_id,
    autoPicked: p.auto_picked,
    pickedAt: p.picked_at,
    player: personFromProfile(profileMap.get(p.profile_id)),
  }));

  const sd = stateRes.data;
  const state: DraftStateView | null = sd
    ? {
        status: (sd.status as DraftStatus) ?? "setup",
        currentOverall: sd.current_overall_pick,
        currentRound: sd.current_round,
        onClockTeamId: sd.on_clock_team_id,
        pickEndsAt: sd.pick_ends_at,
        isPaused: sd.is_paused,
        pausedRemainingMs: sd.paused_remaining_ms,
        lastPickId: sd.last_pick_id,
      }
    : null;

  return {
    seasonId,
    state,
    teams,
    order: (orderRes.data ?? []).map((o) => o.team_id),
    picks,
    pickSeconds,
    picksPerTeam,
    rosterSize,
    draftType: settings.type === "linear" ? "linear" : "snake",
  };
}

/** A team's ordered draft queue (rank ascending) as full people. */
export async function loadQueue(
  supabase: Client,
  seasonId: string,
  teamId: string,
): Promise<DraftPerson[]> {
  const { data: rows } = await supabase
    .from("draft_queues")
    .select("profile_id, rank")
    .eq("season_id", seasonId)
    .eq("team_id", teamId)
    .order("rank", { ascending: true });
  const ids = (rows ?? []).map((r) => r.profile_id);
  if (!ids.length) return [];

  const { data: profs } = await supabase
    .from("profiles")
    .select(PROFILE_LITE_SELECT)
    .in("id", ids);
  const byId = new Map<string, ProfileLite>();
  for (const p of (profs ?? []) as ProfileLite[]) byId.set(p.id, p);
  // Preserve queue order.
  return ids
    .map((id) => personFromProfile(byId.get(id)))
    .filter((p): p is DraftPerson => p !== null);
}

/** Undrafted players in the pool, with the fields the available-table needs.
 * A mock season drafts from mock players (is_mock=true); a real season from the
 * real pool (is_mock=false) — so the two never bleed into each other. */
export async function loadAvailablePool(supabase: Client, seasonId: string): Promise<DraftPerson[]> {
  const { data: season } = await supabase
    .from("seasons")
    .select("slug")
    .eq("id", seasonId)
    .maybeSingle();
  const isMock = season?.slug?.startsWith("mock-") ?? false;

  // Mock players live OUT of the public pool (is_mock=true, in_player_pool=false);
  // real players are the in-pool, non-mock set. The two never mix.
  const poolQuery = isMock
    ? supabase.from("profiles").select(PROFILE_LITE_SELECT).eq("is_mock", true)
    : supabase.from("profiles").select(PROFILE_LITE_SELECT).eq("in_player_pool", true).eq("is_mock", false);

  const [{ data: pool }, { data: drafted }] = await Promise.all([
    poolQuery,
    supabase.from("team_members").select("profile_id").eq("season_id", seasonId),
  ]);
  const draftedIds = new Set((drafted ?? []).map((d) => d.profile_id));
  return ((pool ?? []) as ProfileLite[])
    .filter((p) => !draftedIds.has(p.id))
    .map((p) => personFromProfile(p))
    .filter((p): p is DraftPerson => p !== null);
}
