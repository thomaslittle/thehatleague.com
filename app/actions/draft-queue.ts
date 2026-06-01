"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Captain draft-queue actions. Writes go through RLS (`is_captain_of(team)` OR
 * league ops), so these just need an authenticated caller — the policy is the
 * real gate. The queue drives `autoPickIfExpired` fairness: the on-clock team's
 * top *available* queued player is taken first.
 */

export interface QueueActionState {
  ok?: boolean;
  error?: string;
}

/** Replace a team's queue with an ordered list of profile ids (rank = index). */
export async function setQueue(
  seasonId: string,
  teamId: string,
  profileIds: string[],
): Promise<QueueActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in." };

  const { error: delErr } = await supabase
    .from("draft_queues")
    .delete()
    .eq("season_id", seasonId)
    .eq("team_id", teamId);
  if (delErr) return { error: delErr.message };

  if (profileIds.length) {
    const rows = profileIds.map((profileId, i) => ({
      season_id: seasonId,
      team_id: teamId,
      profile_id: profileId,
      rank: i + 1,
    }));
    const { error: insErr } = await supabase.from("draft_queues").insert(rows);
    if (insErr) return { error: insErr.message };
  }

  revalidatePath("/draft/queue");
  revalidatePath("/the-draft");
  return { ok: true };
}

/** Append a single player to the end of a team's queue (e.g. from a combine card). */
export async function addToQueue(
  seasonId: string,
  teamId: string,
  profileId: string,
): Promise<QueueActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in." };

  const { data: existing } = await supabase
    .from("draft_queues")
    .select("rank")
    .eq("season_id", seasonId)
    .eq("team_id", teamId)
    .order("rank", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextRank = (existing?.rank ?? 0) + 1;

  const { error } = await supabase
    .from("draft_queues")
    .upsert(
      { season_id: seasonId, team_id: teamId, profile_id: profileId, rank: nextRank },
      { onConflict: "season_id,team_id,profile_id", ignoreDuplicates: true },
    );
  if (error) return { error: error.message };

  revalidatePath("/draft/queue");
  revalidatePath("/combine");
  return { ok: true };
}
