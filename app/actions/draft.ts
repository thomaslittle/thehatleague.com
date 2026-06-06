"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { seedDraftOrder, type SeedMethod, type SeedTeam } from "@/lib/draft/seeding";
import { autoPickChoice, type AvailablePlayer } from "@/lib/draft/available";
import type { DraftType } from "@/lib/draft/order";
import type { Json } from "@/lib/supabase/types";

/**
 * Server actions backing the draft engine. The actual pick mutation is the
 * race-safe `make_draft_pick` Postgres RPC (transactional `SELECT … FOR UPDATE`
 * + uniqueness constraints — no double-picks). These actions wrap it with
 * league-ops / on-clock-captain gating, the setup flow (teams, order, settings),
 * and the control-room overrides (pause/resume/undo/extend/setOnClock).
 *
 * Everything returns `DraftActionState` so client mutations get a consistent
 * `{ ok, error }` shape, and every mutation `revalidatePath`s the surfaces that
 * render draft state (Realtime drives the live UI; revalidate keeps RSC fresh).
 */

export interface DraftActionState {
  ok?: boolean;
  error?: string;
  /** Set when the action intentionally did nothing (idempotent no-op). */
  skipped?: boolean;
}

type SupabaseServer = Awaited<ReturnType<typeof createSupabaseServerClient>>;

interface DraftSettings {
  pick_seconds: number;
  roster_size: number;
  captain_is_roster_slot: boolean;
  type: DraftType;
  seed_method: SeedMethod;
}

const DEFAULT_SETTINGS: DraftSettings = {
  pick_seconds: 60,
  roster_size: 3,
  captain_is_roster_slot: true,
  type: "snake",
  seed_method: "rank_asc",
};

function readSettings(raw: unknown): DraftSettings {
  const s = (raw ?? {}) as Record<string, unknown>;
  const type = s.type === "linear" ? "linear" : "snake";
  const seed = ["rank_asc", "rank_desc", "random", "manual"].includes(String(s.seed_method))
    ? (s.seed_method as SeedMethod)
    : DEFAULT_SETTINGS.seed_method;
  return {
    pick_seconds: Number(s.pick_seconds) > 0 ? Number(s.pick_seconds) : DEFAULT_SETTINGS.pick_seconds,
    roster_size: Number(s.roster_size) > 0 ? Number(s.roster_size) : DEFAULT_SETTINGS.roster_size,
    captain_is_roster_slot:
      typeof s.captain_is_roster_slot === "boolean"
        ? s.captain_is_roster_slot
        : DEFAULT_SETTINGS.captain_is_roster_slot,
    type,
    seed_method: seed,
  };
}

function picksPerTeam(s: DraftSettings): number {
  return Math.max(0, s.roster_size - (s.captain_is_roster_slot ? 1 : 0));
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "team"
  );
}

/** Revalidate every surface that renders draft state. */
function revalidateDraft() {
  revalidatePath("/the-draft");
  revalidatePath("/admin/draft");
  revalidatePath("/draft/queue");
}

type Guard =
  | { ok: true; supabase: SupabaseServer; userId: string }
  | { ok: false; error: string };

/** Resolve the signed-in league-ops user, or a graceful error. */
async function leagueOps(): Promise<Guard> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You need to sign in." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return { ok: false, error: "League ops only." };
  return { ok: true, supabase, userId: user.id };
}

async function loadSettings(supabase: SupabaseServer, seasonId: string): Promise<DraftSettings> {
  const { data } = await supabase
    .from("seasons")
    .select("draft_settings")
    .eq("id", seasonId)
    .single();
  return readSettings(data?.draft_settings);
}

// ---------- setup --------------------------------------------------------

/**
 * Create one team per `is_captain` profile that doesn't already have a team in
 * this season, seeding the captain as a roster member. Idempotent.
 */
export async function createTeamsFromCaptains(seasonId: string): Promise<DraftActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const { data: captains, error: capErr } = await supabase
    .from("profiles")
    .select("id, discord_global_name, discord_username")
    .eq("is_captain", true)
    .eq("is_mock", false); // real draft never grabs mock captains
  if (capErr) return { error: capErr.message };
  if (!captains?.length) return { error: "No captains to create teams from." };

  const { data: existing } = await supabase
    .from("teams")
    .select("captain_id, slug")
    .eq("season_id", seasonId);
  const haveCaptain = new Set((existing ?? []).map((t) => t.captain_id));
  const usedSlugs = new Set((existing ?? []).map((t) => t.slug));

  let created = 0;
  for (const cap of captains) {
    if (haveCaptain.has(cap.id)) continue;
    const name = cap.discord_global_name ?? cap.discord_username ?? "Captain";
    let slug = slugify(name);
    let n = 2;
    while (usedSlugs.has(slug)) {
      slug = `${slugify(name)}-${n}`;
      n += 1;
    }
    usedSlugs.add(slug);

    const { data: team, error: teamErr } = await supabase
      .from("teams")
      .insert({ season_id: seasonId, name: `${name}'s Squad`, slug, captain_id: cap.id })
      .select("id")
      .single();
    if (teamErr || !team) return { error: teamErr?.message ?? "Could not create team." };

    // Seed the captain as a roster member (counts as a roster slot by default).
    const { error: memErr } = await supabase.from("team_members").insert({
      team_id: team.id,
      profile_id: cap.id,
      season_id: seasonId,
      is_captain: true,
    });
    if (memErr && !memErr.message.includes("duplicate")) return { error: memErr.message };
    created += 1;
  }

  revalidateDraft();
  return { ok: true, skipped: created === 0 };
}

/**
 * (Re)seed `draft_order` from the season's teams using the configured method
 * (or an override). Writes positions 1..N and mirrors onto `teams.draft_position`.
 */
export async function seedTeams(seasonId: string, methodOverride?: SeedMethod): Promise<DraftActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const settings = await loadSettings(supabase, seasonId);
  const method = methodOverride ?? settings.seed_method;

  const { data: teams, error: teamErr } = await supabase
    .from("teams")
    .select("id, created_at, captain_id")
    .eq("season_id", seasonId);
  if (teamErr) return { error: teamErr.message };
  if (!teams?.length) return { error: "No teams to seed — create teams first." };

  // Pull captain peak ranks for rank-based seeding (separate query keeps the
  // generated relationship typing simple).
  const captainIds = teams.map((t) => t.captain_id).filter((id): id is string => Boolean(id));
  const peakByCaptain = new Map<string, string | null>();
  if (captainIds.length) {
    const { data: caps } = await supabase
      .from("profiles")
      .select("id, peak_rank")
      .in("id", captainIds);
    for (const c of caps ?? []) peakByCaptain.set(c.id, c.peak_rank);
  }

  const seedTeamsInput: SeedTeam[] = teams.map((t) => ({
    id: t.id,
    captainPeakRank: t.captain_id ? (peakByCaptain.get(t.captain_id) ?? null) : null,
    createdAt: t.created_at,
  }));

  const order = seedDraftOrder(seedTeamsInput, method);
  return persistOrder(supabase, seasonId, order);
}

/**
 * Persist an explicit ordered list of team ids as the draft order (control-room
 * manual reorder). Replaces the whole order atomically-ish (delete then insert).
 */
export async function setDraftOrder(seasonId: string, teamIds: string[]): Promise<DraftActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  if (!teamIds.length) return { error: "Order is empty." };
  if (new Set(teamIds).size !== teamIds.length) return { error: "Duplicate team in order." };
  return persistOrder(guard.supabase, seasonId, teamIds);
}

async function persistOrder(
  supabase: SupabaseServer,
  seasonId: string,
  order: string[],
): Promise<DraftActionState> {
  const { error: delErr } = await supabase.from("draft_order").delete().eq("season_id", seasonId);
  if (delErr) return { error: delErr.message };

  const rows = order.map((teamId, i) => ({ season_id: seasonId, position: i + 1, team_id: teamId }));
  const { error: insErr } = await supabase.from("draft_order").insert(rows);
  if (insErr) return { error: insErr.message };

  // Mirror onto teams.draft_position for convenient display.
  for (let i = 0; i < order.length; i += 1) {
    await supabase.from("teams").update({ draft_position: i + 1 }).eq("id", order[i]);
  }

  revalidateDraft();
  return { ok: true };
}

/** Merge a partial settings patch into `seasons.draft_settings`. */
export async function updateDraftSettings(
  seasonId: string,
  patch: Partial<DraftSettings>,
): Promise<DraftActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const current = await loadSettings(supabase, seasonId);
  const next = readSettings({ ...current, ...patch });
  const { error } = await supabase
    .from("seasons")
    .update({ draft_settings: next as unknown as Json })
    .eq("id", seasonId);
  if (error) return { error: error.message };

  revalidateDraft();
  return { ok: true };
}

/** Convenience wrapper for the roster-target controls. */
export async function setRosterTarget(
  seasonId: string,
  rosterSize: number,
  captainIsRosterSlot: boolean,
): Promise<DraftActionState> {
  return updateDraftSettings(seasonId, {
    roster_size: rosterSize,
    captain_is_roster_slot: captainIsRosterSlot,
  });
}

// ---------- run the draft ------------------------------------------------

/** Move the season's draft to `live` and put the first team on the clock. */
export async function startDraft(seasonId: string): Promise<DraftActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const settings = await loadSettings(supabase, seasonId);
  if (picksPerTeam(settings) < 1) {
    return { error: "Roster target leaves no picks — raise roster size." };
  }

  const { data: order, error: orderErr } = await supabase
    .from("draft_order")
    .select("team_id, position")
    .eq("season_id", seasonId)
    .order("position", { ascending: true });
  if (orderErr) return { error: orderErr.message };
  if (!order?.length) return { error: "Seed the draft order before starting." };

  const firstTeam = order[0].team_id;

  // Starting begins at overall pick 1, so any picks from a prior attempt must
  // be cleared — otherwise the first pick collides on
  // (season_id, overall_pick). Captains (is_captain=true) are roster slots and
  // stay; only drafted players are removed.
  await supabase.from("draft_picks").delete().eq("season_id", seasonId);
  await supabase
    .from("team_members")
    .delete()
    .eq("season_id", seasonId)
    .eq("is_captain", false);

  // Team 1 opens "on deck" with the clock NOT started (pick_ends_at = null) —
  // the streamer hits "Start clock" when they're ready to go live.
  const { error } = await supabase.from("draft_state").upsert(
    {
      season_id: seasonId,
      status: "live",
      current_overall_pick: 1,
      current_round: 1,
      on_clock_team_id: firstTeam,
      pick_ends_at: null,
      is_paused: false,
      paused_remaining_ms: null,
      last_pick_id: null,
    },
    { onConflict: "season_id" },
  );
  if (error) return { error: error.message };

  revalidateDraft();
  return { ok: true };
}

/**
 * Start (or restart) the on-clock team's pick timer. After a pick, the next
 * team sits "on deck" with the clock stopped so the reveal can play; this is
 * the streamer's "Start next pick" cue that actually begins the countdown.
 * No-op if the clock is already running.
 */
export async function startPickClock(seasonId: string): Promise<DraftActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const { data: state } = await supabase
    .from("draft_state")
    .select("status, is_paused, pick_ends_at, on_clock_team_id")
    .eq("season_id", seasonId)
    .single();
  if (!state) return { error: "No draft state." };
  if (state.status !== "live") return { error: "Draft isn't live." };
  if (state.is_paused) return { error: "Draft is paused — resume first." };
  if (!state.on_clock_team_id) return { error: "No team on the clock." };
  if (state.pick_ends_at) return { ok: true, skipped: true }; // already running

  const settings = await loadSettings(supabase, seasonId);
  const endsAt = new Date(Date.now() + settings.pick_seconds * 1000).toISOString();
  const { error } = await supabase
    .from("draft_state")
    .update({ pick_ends_at: endsAt, is_paused: false, paused_remaining_ms: null })
    .eq("season_id", seasonId);
  if (error) return { error: error.message };

  revalidateDraft();
  return { ok: true };
}

/**
 * Make a pick. Authorization (league-ops OR on-clock captain), liveness, turn
 * order, pool membership, dedupe, and clock advance all happen inside the
 * race-safe `make_draft_pick` RPC.
 */
export async function makePick(input: {
  seasonId: string;
  profileId: string;
  durationMs?: number;
}): Promise<DraftActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in." };

  const args: { p_season: string; p_profile: string; p_auto: boolean; p_duration?: number } = {
    p_season: input.seasonId,
    p_profile: input.profileId,
    p_auto: false,
  };
  if (typeof input.durationMs === "number") args.p_duration = input.durationMs;
  const { error } = await supabase.rpc("make_draft_pick", args);
  if (error) return { error: error.message };

  revalidateDraft();
  return { ok: true };
}

/**
 * Fairness backstop: if the on-clock timer has expired, auto-pick the on-clock
 * team's top *available* queued player, else the best available by rank. Driven
 * from the control room (and optionally a scheduled tick). Idempotent — a no-op
 * if the draft isn't live or is paused. The scheduled path only fires once the
 * clock has expired; the control room's "Auto-pick now" passes `force` so the
 * streamer can pick on behalf of an AFK captain mid-clock.
 */
export async function autoPickIfExpired(
  seasonId: string,
  force = false,
): Promise<DraftActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const { data: state } = await supabase
    .from("draft_state")
    .select("status, is_paused, pick_ends_at, on_clock_team_id")
    .eq("season_id", seasonId)
    .single();
  if (!state || state.status !== "live" || state.is_paused) return { ok: true, skipped: true };
  if (!force && (!state.pick_ends_at || Date.parse(state.pick_ends_at) > Date.now())) {
    return { ok: true, skipped: true };
  }
  if (!state.on_clock_team_id) return { error: "No team on the clock." };

  // The on-clock team's queue (highest priority first).
  const { data: queue } = await supabase
    .from("draft_queues")
    .select("profile_id, rank")
    .eq("season_id", seasonId)
    .eq("team_id", state.on_clock_team_id)
    .order("rank", { ascending: true });
  const queuedIds = (queue ?? []).map((q) => q.profile_id);

  // The full pool + who's already drafted. A mock season draws from mock
  // players, a real season from the real pool — never cross-contaminate.
  const { data: seasonRow } = await supabase
    .from("seasons")
    .select("slug")
    .eq("id", seasonId)
    .maybeSingle();
  const isMock = seasonRow?.slug?.startsWith("mock-") ?? false;
  const poolQuery = isMock
    ? supabase.from("profiles").select("id, peak_rank, rank_3v3, rank_2v2, created_at").eq("is_mock", true)
    : supabase
        .from("profiles")
        .select("id, peak_rank, rank_3v3, rank_2v2, created_at")
        .eq("in_player_pool", true)
        .eq("is_mock", false);
  const { data: pool } = await poolQuery;
  const { data: drafted } = await supabase
    .from("team_members")
    .select("profile_id")
    .eq("season_id", seasonId);
  const draftedIds = new Set((drafted ?? []).map((d) => d.profile_id));

  const choice = autoPickChoice((pool ?? []) as AvailablePlayer[], draftedIds, queuedIds);
  if (!choice) return { error: "No available players to auto-pick." };

  const { error } = await supabase.rpc("make_draft_pick", {
    p_season: seasonId,
    p_profile: choice,
    p_auto: true,
  });
  if (error) return { error: error.message };

  revalidateDraft();
  return { ok: true };
}

// ---------- control-room overrides --------------------------------------

/**
 * Reassign a drafted player to a different team (league-ops correction / trade).
 * Updates both the roster row and the historical pick so the board, rosters and
 * overlays all reflect the move. Captains aren't moved (they own their team).
 */
export async function movePlayer(
  seasonId: string,
  profileId: string,
  toTeamId: string,
): Promise<DraftActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("id", toTeamId)
    .eq("season_id", seasonId)
    .maybeSingle();
  if (!team) return { error: "That team isn't in this season." };

  const { error: memErr } = await supabase
    .from("team_members")
    .update({ team_id: toTeamId })
    .eq("season_id", seasonId)
    .eq("profile_id", profileId)
    .eq("is_captain", false);
  if (memErr) return { error: memErr.message };

  // Keep the historical pick pointed at the player's current team too.
  await supabase
    .from("draft_picks")
    .update({ team_id: toTeamId })
    .eq("season_id", seasonId)
    .eq("profile_id", profileId);

  revalidateDraft();
  return { ok: true };
}

/** Pause the clock, banking the remaining milliseconds. */
export async function pauseDraft(seasonId: string): Promise<DraftActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const { data: state } = await supabase
    .from("draft_state")
    .select("status, is_paused, pick_ends_at")
    .eq("season_id", seasonId)
    .single();
  if (!state) return { error: "No draft state." };
  if (state.status !== "live") return { error: "Draft isn't live." };
  if (state.is_paused) return { ok: true, skipped: true };

  const remaining = state.pick_ends_at
    ? Math.max(0, Date.parse(state.pick_ends_at) - Date.now())
    : null;
  const { error } = await supabase
    .from("draft_state")
    .update({ is_paused: true, paused_remaining_ms: remaining })
    .eq("season_id", seasonId);
  if (error) return { error: error.message };

  revalidateDraft();
  return { ok: true };
}

/** Resume the clock, restoring the banked remaining milliseconds. */
export async function resumeDraft(seasonId: string): Promise<DraftActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const { data: state } = await supabase
    .from("draft_state")
    .select("status, is_paused, paused_remaining_ms")
    .eq("season_id", seasonId)
    .single();
  if (!state) return { error: "No draft state." };
  if (!state.is_paused) return { ok: true, skipped: true };

  const settings = await loadSettings(supabase, seasonId);
  const remainingMs = state.paused_remaining_ms ?? settings.pick_seconds * 1000;
  const endsAt = new Date(Date.now() + remainingMs).toISOString();
  const { error } = await supabase
    .from("draft_state")
    .update({ is_paused: false, paused_remaining_ms: null, pick_ends_at: endsAt })
    .eq("season_id", seasonId);
  if (error) return { error: error.message };

  revalidateDraft();
  return { ok: true };
}

/** Add (or with a negative value, subtract) seconds from the current clock. */
export async function extendClock(seasonId: string, seconds: number): Promise<DraftActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const { data: state } = await supabase
    .from("draft_state")
    .select("is_paused, paused_remaining_ms, pick_ends_at")
    .eq("season_id", seasonId)
    .single();
  if (!state) return { error: "No draft state." };

  const deltaMs = Math.round(seconds * 1000);
  if (state.is_paused) {
    const next = Math.max(0, (state.paused_remaining_ms ?? 0) + deltaMs);
    const { error } = await supabase
      .from("draft_state")
      .update({ paused_remaining_ms: next })
      .eq("season_id", seasonId);
    if (error) return { error: error.message };
  } else {
    const base = state.pick_ends_at ? Date.parse(state.pick_ends_at) : Date.now();
    const endsAt = new Date(Math.max(Date.now(), base + deltaMs)).toISOString();
    const { error } = await supabase
      .from("draft_state")
      .update({ pick_ends_at: endsAt })
      .eq("season_id", seasonId);
    if (error) return { error: error.message };
  }

  revalidateDraft();
  return { ok: true };
}

/** Manually override which team is on the clock and reset the timer. */
export async function setOnClock(seasonId: string, teamId: string): Promise<DraftActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const settings = await loadSettings(supabase, seasonId);
  const endsAt = new Date(Date.now() + settings.pick_seconds * 1000).toISOString();
  const { error } = await supabase
    .from("draft_state")
    .update({
      on_clock_team_id: teamId,
      pick_ends_at: endsAt,
      is_paused: false,
      paused_remaining_ms: null,
    })
    .eq("season_id", seasonId);
  if (error) return { error: error.message };

  revalidateDraft();
  return { ok: true };
}

/**
 * Undo the most recent pick: remove the roster row + the pick, and rewind
 * `draft_state` to put that team back on the clock. League-ops only.
 */
export async function undoLastPick(seasonId: string): Promise<DraftActionState> {
  const guard = await leagueOps();
  if (!guard.ok) return { error: guard.error };
  const { supabase } = guard;

  const { data: state } = await supabase
    .from("draft_state")
    .select("last_pick_id")
    .eq("season_id", seasonId)
    .single();
  if (!state?.last_pick_id) return { error: "Nothing to undo." };

  const { data: pick } = await supabase
    .from("draft_picks")
    .select("id, overall_pick, round, team_id, profile_id")
    .eq("id", state.last_pick_id)
    .single();
  if (!pick) return { error: "Last pick not found." };

  // Remove the roster membership for the drafted player, then the pick row.
  const { error: memErr } = await supabase
    .from("team_members")
    .delete()
    .eq("season_id", seasonId)
    .eq("profile_id", pick.profile_id)
    .eq("is_captain", false);
  if (memErr) return { error: memErr.message };

  const { error: pickErr } = await supabase.from("draft_picks").delete().eq("id", pick.id);
  if (pickErr) return { error: pickErr.message };

  // The pick that now becomes "last" (highest overall below the undone one).
  const { data: prev } = await supabase
    .from("draft_picks")
    .select("id")
    .eq("season_id", seasonId)
    .lt("overall_pick", pick.overall_pick)
    .order("overall_pick", { ascending: false })
    .limit(1)
    .maybeSingle();

  const settings = await loadSettings(supabase, seasonId);
  const endsAt = new Date(Date.now() + settings.pick_seconds * 1000).toISOString();
  const { error: stateErr } = await supabase
    .from("draft_state")
    .update({
      status: "live",
      current_overall_pick: pick.overall_pick,
      current_round: pick.round,
      on_clock_team_id: pick.team_id,
      pick_ends_at: endsAt,
      is_paused: false,
      paused_remaining_ms: null,
      last_pick_id: prev?.id ?? null,
    })
    .eq("season_id", seasonId);
  if (stateErr) return { error: stateErr.message };

  revalidateDraft();
  return { ok: true };
}
