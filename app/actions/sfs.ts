"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface SfsActionState {
  ok?: boolean;
  error?: string;
}

/** Log an own goal. Any signed-in user can contribute; they may tag a
 *  registered player (profileId) or type a free-text name. */
export async function logOwnGoal(input: {
  profileId?: string | null;
  playerName?: string | null;
  note?: string | null;
}): Promise<SfsActionState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to log an own goal." };

  const profileId = input.profileId || null;
  const playerName = (input.playerName ?? "").trim() || null;
  if (!profileId && !playerName) {
    return { error: "Pick a player or type a name." };
  }

  const { error } = await supabase.from("sfs_own_goals").insert({
    profile_id: profileId,
    player_name: profileId ? null : playerName,
    reported_by: user.id,
    note: (input.note ?? "").trim() || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/shitfaced-saturday");
  return { ok: true };
}

/** Remove an own goal (the reporter or league ops, enforced by RLS). */
export async function deleteOwnGoal(id: string): Promise<SfsActionState> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("sfs_own_goals").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/shitfaced-saturday");
  return { ok: true };
}
