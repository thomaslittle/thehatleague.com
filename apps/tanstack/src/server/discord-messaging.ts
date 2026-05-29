// Discord messaging — server-side only.
//
// Webhook URL fan-out (DISCORD_ANNOUNCEMENTS_WEBHOOK_URL). Easiest path —
// no bot, no scopes, just POST a JSON body. Used for announcement
// fan-out. Silent no-op when the env var is unset so local dev is safe.

import { env } from "@/lib/env";

export interface AnnouncementWebhookPayload {
  title: string;
  body: string;
  url: string;
  pinned: boolean;
}

export async function broadcastAnnouncementToDiscord(
  payload: AnnouncementWebhookPayload,
): Promise<{ ok: boolean; reason?: string }> {
  const url = env.DISCORD_ANNOUNCEMENTS_WEBHOOK_URL;
  if (!url) return { ok: false, reason: "webhook_not_configured" };

  const body = {
    username: "The Hat League",
    avatar_url: env.SITE_URL
      ? `${env.SITE_URL.replace(/\/$/, "")}/brand/thl-logo.png`
      : undefined,
    embeds: [
      {
        title: payload.title,
        url: payload.url,
        description: payload.body.slice(0, 1800),
        color: 0xf76103,
        footer: {
          text: payload.pinned
            ? "Pinned · From league ops"
            : "From league ops",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return {
      ok: res.ok,
      reason: res.ok ? undefined : `http_${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "fetch_failed",
    };
  }
}
