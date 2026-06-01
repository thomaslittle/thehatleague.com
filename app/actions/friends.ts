"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface FriendActionState {
  ok?: boolean;
  error?: string;
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Sign in first." };
  return { ok: true as const, supabase, userId: user.id };
}

/** Match either direction of a friendship between two profiles. */
function pairFilter(a: string, b: string): string {
  return `and(requester_id.eq.${a},addressee_id.eq.${b}),and(requester_id.eq.${b},addressee_id.eq.${a})`;
}

/** Send a friend request by the target's discord username. */
export async function sendFriendRequest(targetUsername: string): Promise<FriendActionState> {
  const g = await requireUser();
  if (!g.ok) return { error: g.error };
  const { supabase, userId } = g;

  const handle = targetUsername.trim().replace(/^@/, "");
  if (!handle) return { error: "Enter a username." };

  const { data: target } = await supabase
    .from("profiles")
    .select("id")
    .ilike("discord_username", handle)
    .maybeSingle();
  if (!target) return { error: "No player with that username." };
  if (target.id === userId) return { error: "You can't add yourself." };

  const { data: existing } = await supabase
    .from("friendships")
    .select("status")
    .or(pairFilter(userId, target.id))
    .maybeSingle();
  if (existing) {
    return { error: existing.status === "accepted" ? "You're already friends." : "A request is already pending." };
  }

  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: userId, addressee_id: target.id });
  if (error) return { error: error.message };

  revalidatePath("/friends");
  return { ok: true };
}

/** Accept (true) or decline/delete (false) an incoming request. RLS limits update to the addressee. */
export async function respondToFriendRequest(id: string, accept: boolean): Promise<FriendActionState> {
  const g = await requireUser();
  if (!g.ok) return { error: g.error };
  const { supabase } = g;

  const { error } = accept
    ? await supabase
        .from("friendships")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("id", id)
    : await supabase.from("friendships").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/friends");
  return { ok: true };
}

/** Unfriend, or cancel an outgoing request. RLS limits delete to either party. */
export async function removeFriend(otherId: string): Promise<FriendActionState> {
  const g = await requireUser();
  if (!g.ok) return { error: g.error };
  const { supabase, userId } = g;

  const { error } = await supabase.from("friendships").delete().or(pairFilter(userId, otherId));
  if (error) return { error: error.message };

  revalidatePath("/friends");
  return { ok: true };
}
