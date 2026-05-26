// Discord messaging — server-side only.
//
// Two paths today:
//   1. Webhook URL (DISCORD_ANNOUNCEMENTS_WEBHOOK_URL). Easiest — no bot,
//      no scopes, just POST a JSON body. Used for announcement fan-out.
//   2. Full bot REST API (DISCORD_BOT_TOKEN). Required for DMs to users
//      and captains. Stubbed below.
//
// Both no-op cleanly when the relevant env var is unset — local dev is
// safe.

import "server-only";

export interface DiscordMessageOptions {
  content: string;
  /** A Discord user id — uses the bot's DM channel for that user. */
  toUserId?: string;
  /** A Discord channel id (announcements, captains-only, etc.). */
  toChannelId?: string;
}

export async function sendDiscordMessage(
  _opts: DiscordMessageOptions,
): Promise<{ ok: boolean }> {
  // TODO(messaging): once the bot is provisioned, use the REST API:
  //   POST https://discord.com/api/v10/users/@me/channels  ->  { dm channel id }
  //   POST https://discord.com/api/v10/channels/{id}/messages
  // Authenticate with the Bot token from process.env.DISCORD_BOT_TOKEN.
  // Always run server-side. Never expose the bot token to the client.
  return { ok: false };
}

export interface AnnouncementWebhookPayload {
  title: string;
  body: string;
  url: string;
  pinned: boolean;
}

/**
 * POST a new announcement to the league-ops-owned Discord webhook. Silent
 * no-op when DISCORD_ANNOUNCEMENTS_WEBHOOK_URL is unset (i.e. always in
 * dev). Errors are swallowed — failing the Server Action because Discord
 * is down would be the wrong UX.
 */
export async function broadcastAnnouncementToDiscord(
  payload: AnnouncementWebhookPayload,
): Promise<{ ok: boolean; reason?: string }> {
  const url = process.env.DISCORD_ANNOUNCEMENTS_WEBHOOK_URL;
  if (!url) return { ok: false, reason: "webhook_not_configured" };

  const body = {
    username: "The Hat League",
    avatar_url: process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/brand/thl-logo.png`
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
    return { ok: res.ok, reason: res.ok ? undefined : `http_${res.status}` };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "fetch_failed" };
  }
}
