"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

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
    toast.custom(
      (id) => (
        <div className="relative w-[min(92vw,420px)] overflow-hidden rounded-2xl border border-thl-orange/55 bg-neutral-950 text-white shadow-[0_28px_90px_-32px_rgba(247,97,3,0.95)]">
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-1.5 bg-thl-orange"
          />
          <div
            aria-hidden
            className="absolute -top-20 -right-16 h-40 w-40 rounded-full bg-thl-orange/25 blur-3xl"
          />
          <div className="relative flex gap-4 p-4 pr-12">
            <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-thl-orange font-marker text-lg leading-none text-black shadow-[0_10px_30px_-12px_rgba(247,97,3,1)]">
              THL
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold tracking-[0.24em] text-thl-orange uppercase">
                Settings saved
              </div>
              <p className="mt-1 text-sm leading-relaxed text-neutral-200">
                <span className="font-extrabold text-white">{copy.prefix}</span>{" "}
                {copy.body}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toast.dismiss(id)}
              className="absolute top-3 right-3 rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ),
      { duration: 5200, id: `settings-saved-${kind}` },
    );
  }, [kind]);

  return null;
}
