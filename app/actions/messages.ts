"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Sign in first." };
  return { ok: true as const, supabase, userId: user.id };
}

export interface OpenConversationState {
  ok?: boolean;
  conversationId?: string;
  error?: string;
}

/** Start (or reuse) a 1:1 DM with another user. RPC gates to friends/teammates. */
export async function startDm(otherId: string): Promise<OpenConversationState> {
  const g = await requireUser();
  if (!g.ok) return { error: g.error };
  const { data, error } = await g.supabase.rpc("start_dm", { other: otherId });
  if (error) return { error: error.message };
  return { ok: true, conversationId: data as string };
}

/** Open (or create) the chat channel for a team. RPC gates to team members. */
export async function openTeamConversation(teamId: string): Promise<OpenConversationState> {
  const g = await requireUser();
  if (!g.ok) return { error: g.error };
  const { data, error } = await g.supabase.rpc("get_or_create_team_conversation", { p_team: teamId });
  if (error) return { error: error.message };
  return { ok: true, conversationId: data as string };
}

export interface MessageActionState {
  ok?: boolean;
  error?: string;
}

/** Post a message. RLS enforces sender + conversation access. */
export async function sendMessage(conversationId: string, body: string): Promise<MessageActionState> {
  const g = await requireUser();
  if (!g.ok) return { error: g.error };
  const text = body.trim();
  if (!text) return { error: "Message can't be empty." };
  if (text.length > 4000) return { error: "Message is too long." };

  const { error } = await g.supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: g.userId, body: text });
  if (error) return { error: error.message };
  return { ok: true };
}

/** Mark a conversation read up to now (drives unread badges). */
export async function markRead(conversationId: string): Promise<MessageActionState> {
  const g = await requireUser();
  if (!g.ok) return { error: g.error };
  const { error } = await g.supabase.rpc("mark_conversation_read", { conv: conversationId });
  if (error) return { error: error.message };
  return { ok: true };
}
