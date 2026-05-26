import "server-only";

import { cache } from "react";
import { getTwitchAccessToken } from "@/lib/twitch/auth";

/**
 * Twitch Helix integration — server-only, cached.
 *
 * Requires TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET set as env vars.
 * Without them, every call returns null and the UI hides the live badge
 * (same graceful-no-op pattern as the Discord webhook stub).
 *
 * The Twitch app-access token is acquired client-credentials style; we
 * cache it on the module scope and refresh proactively when it's close to
 * expiring. The stream-check itself runs through React's request-scoped
 * `cache()` so a single render only fires one fetch, and Next's
 * `revalidate: 60` keeps the response warm across renders.
 */

export interface TwitchLiveInfo {
  isLive: boolean;
  title: string | null;
  gameName: string | null;
  viewers: number | null;
  startedAt: string | null;
  url: string;
}

const TWITCH_LOGIN = "hat_dad_gaming";
const STREAM_URL = `https://www.twitch.tv/${TWITCH_LOGIN}`;

/**
 * Cached for the duration of a single request via React's request cache
 * and for 60s across requests via Next's data cache.
 */
export const getTwitchLive = cache(
  async (): Promise<TwitchLiveInfo | null> => {
    const clientId = process.env.TWITCH_CLIENT_ID;
    if (!clientId) return null;
    const token = await getTwitchAccessToken();
    if (!token) return null;

    const res = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${TWITCH_LOGIN}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": clientId,
        },
        next: { revalidate: 60, tags: ["twitch:live"] },
      },
    ).catch(() => null);
    if (!res || !res.ok) return null;

    const json = (await res.json().catch(() => null)) as
      | {
          data: Array<{
            title: string;
            game_name: string;
            viewer_count: number;
            started_at: string;
          }>;
        }
      | null;
    if (!json) return null;

    const stream = json.data[0];
    if (!stream) {
      return {
        isLive: false,
        title: null,
        gameName: null,
        viewers: null,
        startedAt: null,
        url: STREAM_URL,
      };
    }

    return {
      isLive: true,
      title: stream.title,
      gameName: stream.game_name,
      viewers: stream.viewer_count,
      startedAt: stream.started_at,
      url: STREAM_URL,
    };
  },
);
