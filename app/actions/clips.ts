"use server";

import { updateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Add a 👍 reaction to a Discord message via the signed-in user's Discord
 * OAuth token — used as the
 * "like" backing for the landing-page clip cards. Requires the user to
 * be signed in so we never let anonymous traffic spam reactions.
 *
 * The Discord user needs channel access and `Read Message History`; if this
 * is the first 👍 on the message, they also need `Add Reactions`.
 */
export type LikeClipResult =
  | { ok: true }
  | { ok: false; error: "auth" | "config" | "discord" };

export async function likeClip(formData: FormData): Promise<LikeClipResult> {
  const messageId = String(formData.get("message_id") ?? "").trim();
  if (!messageId) return { ok: false, error: "discord" };

  const supabase = await createSupabaseServerClient();
  const [{ data: userData }, { data: sessionData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);
  const user = userData.user;
  if (!user) return { ok: false, error: "auth" };

  const token = sessionData.session?.provider_token;
  const channelId = process.env.DISCORD_CLIPS_CHANNEL_ID;
  if (!token || !channelId) {
    console.warn("likeClip skipped: missing Discord OAuth token or channel id");
    return { ok: false, error: token ? "config" : "auth" };
  }

  // PUT /channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me
  // %F0%9F%91%8D is URL-encoded 👍.
  const url = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}/reactions/%F0%9F%91%8D/@me`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "TheHatLeague (https://thehatleague.com, 0.1.0)",
    },
  }).catch(() => null);
  if (!res || !res.ok) {
    if (res) {
      console.error(
        "likeClip Discord reaction failed:",
        res.status,
        res.statusText,
      );
    }
    return { ok: false, error: "discord" };
  }

  // Invalidate the cached clip list so the new count shows on next render.
  updateTag("discord:clips");
  return { ok: true };
}
