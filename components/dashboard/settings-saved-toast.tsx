"use client";

import { useEffect } from "react";
import { showLeagueToast } from "@/components/ui/league-toast";

const SETTINGS_TOAST_COPY = {
  rank_profile: {
    prefix: "Rank profile",
    body: "changes were saved. Captains will see the updated card.",
  },
  pool_rejoined: {
    prefix: "Season 04 pool",
    body: "selection was saved. You are visible to captains again.",
  },
  pool_left: {
    prefix: "Season 04 pool",
    body: "selection was saved. You are out of the draft pool.",
  },
  profile_card: {
    prefix: "Player profile",
    body: "changes were saved. Your public card is updated.",
  },
} as const;

export type SettingsToastKind = keyof typeof SETTINGS_TOAST_COPY;

export function SettingsSavedToast({
  kind,
}: {
  kind: SettingsToastKind | null;
}) {
  useEffect(() => {
    if (!kind) return;

    const copy = SETTINGS_TOAST_COPY[kind];
    showLeagueToast({
      id: `settings-saved-${kind}`,
      eyebrow: "Settings saved",
      prefix: copy.prefix,
      body: copy.body,
    });
  }, [kind]);

  return null;
}
