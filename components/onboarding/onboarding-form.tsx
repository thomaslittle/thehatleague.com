"use client";

import { useActionState } from "react";
import { ArrowRight, LinkIcon } from "@/components/icons/brand";
import { submitOnboarding, type OnboardingState } from "@/app/actions/onboarding";
import {
  RL_PEAK_PLAYLISTS,
  RL_RANK_TIERS,
} from "@/lib/data/rocket-league-ranks";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PLAYLIST_LABELS: Record<(typeof RL_PEAK_PLAYLISTS)[number], string> = {
  "2v2": "2v2 Doubles",
  "3v3": "3v3 Standard",
  "1v1": "1v1 Duels",
  hoops: "Hoops",
  rumble: "Rumble",
  dropshot: "Dropshot",
  snowday: "Snow Day",
  other: "Other / Tournament",
};

export interface OnboardingFormDefaults {
  tracker_url?: string | null;
  rank_2v2?: string | null;
  rank_3v3?: string | null;
  peak_rank?: string | null;
  peak_playlist?: string | null;
}

export function OnboardingForm({
  defaults,
  submitLabel = "Drop me in the pool",
  pendingLabel = "Locking it in…",
  from,
}: {
  defaults?: OnboardingFormDefaults;
  submitLabel?: string;
  pendingLabel?: string;
  from?: "settings" | "onboarding";
} = {}) {
  const [state, action, pending] = useActionState<
    OnboardingState | undefined,
    FormData
  >(submitOnboarding, undefined);

  const fe = state?.fieldErrors ?? {};
  const d = defaults ?? {};

  return (
    <form action={action} className="grid gap-7">
      {from && <input type="hidden" name="_from" value={from} />}

      <Field
        label="Tracker profile URL"
        htmlFor="tracker_url"
        hint="We use this to pull updated ranks later. Find it on rocketleague.tracker.network."
        error={fe.tracker_url}
      >
        <div className="relative">
          <LinkIcon className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            id="tracker_url"
            name="tracker_url"
            type="url"
            autoComplete="off"
            defaultValue={d.tracker_url ?? ""}
            placeholder="https://rocketleague.tracker.network/rocket-league/profile/..."
            invalid={!!fe.tracker_url}
            required
            className="pl-10"
          />
        </div>
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Current 2v2 rank"
          hint="As it shows in-game right now."
          error={fe.rank_2v2}
        >
          <RankSelect name="rank_2v2" defaultValue={d.rank_2v2 ?? ""} invalid={!!fe.rank_2v2} />
        </Field>
        <Field
          label="Current 3v3 rank"
          hint="As it shows in-game right now."
          error={fe.rank_3v3}
        >
          <RankSelect name="rank_3v3" defaultValue={d.rank_3v3 ?? ""} invalid={!!fe.rank_3v3} />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <Field
          label="Highest rank you've ever hit"
          hint="Any season, any playlist. Be honest — captains can see this."
          error={fe.peak_rank}
        >
          <RankSelect
            name="peak_rank"
            defaultValue={d.peak_rank ?? ""}
            invalid={!!fe.peak_rank}
          />
        </Field>
        <Field
          label="…in which playlist?"
          hint="Where you peaked."
          error={fe.peak_playlist}
        >
          <Select name="peak_playlist" defaultValue={d.peak_playlist ?? ""}>
            <SelectTrigger invalid={!!fe.peak_playlist}>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {RL_PEAK_PLAYLISTS.map((p) => (
                <SelectItem key={p} value={p}>
                  {PLAYLIST_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {state?.error && (
        <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? pendingLabel : submitLabel}
          {!pending && <ArrowRight className="h-4 w-4" />}
        </Button>
        <p className="text-xs text-neutral-500">
          You can update these any time from your dashboard.
        </p>
      </div>
    </form>
  );
}

function RankSelect({
  name,
  defaultValue = "",
  invalid = false,
}: {
  name: string;
  defaultValue?: string;
  invalid?: boolean;
}) {
  return (
    <Select name={name} defaultValue={defaultValue}>
      <SelectTrigger invalid={invalid}>
        <SelectValue placeholder="Select…" />
      </SelectTrigger>
      <SelectContent>
        {RL_RANK_TIERS.map((r) => (
          <SelectItem key={r} value={r}>
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
