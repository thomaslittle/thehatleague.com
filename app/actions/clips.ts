"use server";

import { updateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Add a 👍 reaction to a Discord message via the bot — used as the
 * "like" backing for the landing-page clip cards. Requires the user to
 * be signed in so we never let anonymous traffic spam reactions.
 *
 * The bot needs `Add Reactions` permission on the clips channel
 * (in addition to View Channel + Read Message History).
 */
export async function likeClip(formData: FormData): Promise<void> {
  const messageId = String(formData.get("message_id") ?? "").trim();
  if (!messageId) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return; // silently no-op for anon — UI gates on auth

  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CLIPS_CHANNEL_ID;
  if (!token || !channelId) return;

  // PUT /channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me
  // %F0%9F%91%8D is URL-encoded 👍.
  const url = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}/reactions/%F0%9F%91%8D/@me`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${token}`,
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
    return;
  }

  // Invalidate the cached clip list so the new count shows on next render.
  updateTag("discord:clips");
}
