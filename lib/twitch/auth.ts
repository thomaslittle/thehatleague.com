import "server-only";

// Shared Twitch Helix app-access-token cache so both the live-status badge
// and the clip-metadata lookup hit the same token. Without TWITCH_CLIENT_ID
// + TWITCH_CLIENT_SECRET this returns null and callers fall back gracefully.

let tokenCache: { accessToken: string; expiresAt: number } | null = null;

export async function getTwitchAccessToken(): Promise<string | null> {
  const id = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  if (!id || !secret) return null;

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.accessToken;
  }

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: id,
      client_secret: secret,
      grant_type: "client_credentials",
    }).toString(),
    cache: "no-store",
  }).catch(() => null);
  if (!res || !res.ok) return null;

  const json = (await res.json().catch(() => null)) as
    | { access_token: string; expires_in: number }
    | null;
  if (!json) return null;

  tokenCache = {
    accessToken: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return tokenCache.accessToken;
}

export function getTwitchClientId(): string | null {
  return process.env.TWITCH_CLIENT_ID ?? null;
}
