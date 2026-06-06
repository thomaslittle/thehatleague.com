// Shared overlay-settings data layer (client-agnostic, like lib/data/draft).
// The control room writes these; every OBS overlay reads them in real time.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export type OverlayScene =
  | "on_clock"
  | "last_pick"
  | "ticker"
  | "board"
  | "best_available"
  | "lower_third"
  | "standings";

export interface OverlaySettingsView {
  activeScene: string;
  theme: string;
  showTimer: boolean;
  showRecentPicks: boolean;
  /** Show the next-up teams on the on-clock card. */
  showOnDeck: boolean;
  /** How long the pick reveal card holds before returning to on-clock. */
  revealSeconds: number;
  /** Play the reveal sound (OBS only). */
  revealSound: boolean;
  lowerThird: string | null;
  tickerText: string | null;
  accent: string | null;
  token: string;
}

export async function loadOverlaySettings(
  supabase: Client,
  seasonId: string,
): Promise<OverlaySettingsView | null> {
  const { data } = await supabase
    .from("overlay_settings")
    .select(
      "active_scene, theme, show_timer, show_recent_picks, show_on_deck, reveal_seconds, reveal_sound, lower_third, ticker_text, accent, overlay_token",
    )
    .eq("season_id", seasonId)
    .maybeSingle();
  if (!data) return null;
  return {
    activeScene: data.active_scene,
    theme: data.theme,
    showTimer: data.show_timer,
    showRecentPicks: data.show_recent_picks,
    showOnDeck: data.show_on_deck,
    revealSeconds: data.reveal_seconds,
    revealSound: data.reveal_sound,
    lowerThird: data.lower_third,
    tickerText: data.ticker_text,
    accent: data.accent,
    token: data.overlay_token,
  };
}

/** The widgets a streamer can add as browser sources (for the control-room list). */
export const OVERLAY_WIDGETS: { path: string; label: string; note: string }[] = [
  { path: "/overlay/scene", label: "Scene director", note: "One source; switches from control room" },
  { path: "/overlay/draft/on-clock", label: "On the clock", note: "Team + captain + live timer" },
  { path: "/overlay/draft/last-pick", label: "Last pick (reveal)", note: "Coin-flip pick reveal + sound" },
  { path: "/overlay/draft/ticker", label: "Ticker", note: "Scrolling recent picks + ticker text" },
  { path: "/overlay/draft/board", label: "Board", note: "Compact full draft grid" },
  { path: "/overlay/draft/best-available", label: "Best available", note: "Top undrafted by rank" },
  { path: "/overlay/lower-third", label: "Lower third", note: "Banner text from control room" },
  { path: "/overlay/patch-unlock", label: "Patch unlock", note: "Latest patch unlock reveal" },
  { path: "/overlay/standings", label: "Standings", note: "Live tournament standings" },
  { path: "/overlay/power-players", label: "Power players", note: "Top league-points players" },
  { path: "/overlay/matchup", label: "Matchup", note: "Add &id=<matchId> for a single match" },
];
