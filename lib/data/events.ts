// Derives the ordered "upcoming events" for the active season from its key
// dates. Pure — the landing countdown consumes this. Combine → Draft → Kickoff.

import type { Season } from "@/lib/supabase/types";

export interface LeagueEvent {
  key: "combine" | "draft" | "kickoff";
  label: string;
  /** ISO timestamp, or null when TBA. */
  at: string | null;
  href: string;
  blurb: string;
}

export function deriveEvents(season: Season | null): LeagueEvent[] {
  if (!season) return [];
  return [
    {
      key: "combine",
      label: "Draft Combine",
      at: season.combine_at,
      href: "/combine",
      blurb: "Players showcase. Captains scout.",
    },
    {
      key: "draft",
      label: "Draft Night",
      at: season.draft_at,
      href: "/the-draft",
      blurb: "Live on Twitch. Captains build their squads.",
    },
    {
      key: "kickoff",
      label: "Season Kickoff",
      at: season.regular_starts_at,
      href: "/schedule",
      blurb: "First whistle. The grind begins.",
    },
  ];
}

/** Index of the next event with a future date, or -1 if none/TBA. */
export function nextEventIndex(events: readonly LeagueEvent[], nowMs: number): number {
  return events.findIndex((e) => e.at != null && Date.parse(e.at) > nowMs);
}
