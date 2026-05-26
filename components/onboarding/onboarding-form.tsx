"use client";

import { useActionState, useState } from "react";
import { ArrowRight, LinkIcon } from "@/components/icons/brand";
import { submitOnboarding, type OnboardingState } from "@/app/actions/onboarding";
import {
  RL_PEAK_PLAYLISTS,
  RL_RANK_TIERS,
} from "@/lib/data/rocket-league-ranks";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  in_player_pool?: boolean | null;
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
  const defaultPoolOptIn = d.in_player_pool ?? true;
  const showPoolOptIn = from !== "settings";
  const [poolOptIn, setPoolOptIn] = useState(defaultPoolOptIn);
  const effectiveSubmitLabel = showPoolOptIn
    ? poolOptIn
      ? "Save ranks and join the pool"
      : "Save ranks without joining"
    : submitLabel;

  return (
    <form action={action} className="grid gap-7">
      {from && <input type="hidden" name="_from" value={from} />}

      {showPoolOptIn && (
        <label
          htmlFor="join_season_pool"
          className="group relative block cursor-pointer overflow-hidden rounded-2xl border-2 border-thl-orange bg-thl-orange/10 p-5 shadow-[0_18px_55px_-30px_rgba(247,97,3,0.8)] transition hover:bg-thl-orange/15 md:p-6 dark:bg-thl-orange/12 dark:hover:bg-thl-orange/18"
        >
          <input type="hidden" name="join_pool_present" value="1" />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-20 h-44 w-44 rounded-full bg-thl-orange/20 blur-3xl"
          />
          <div className="relative flex items-start gap-4">
            <Checkbox
              id="join_season_pool"
              name="join_pool"
              value="1"
              checked={poolOptIn}
              onCheckedChange={(checked) => setPoolOptIn(checked === true)}
              className="mt-1 h-7 w-7 rounded-lg border-2 border-thl-orange bg-white shadow-sm data-[state=checked]:bg-thl-orange dark:bg-black"
            />
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold tracking-[0.24em] text-thl-orange uppercase">
                Season 04 pool
              </div>
              <div className="mt-1 text-xl leading-tight font-extrabold tracking-[-0.01em] text-neutral-950 md:text-2xl dark:text-white">
                Yes, put me in the draft pool.
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                Selected by default. Leave this checked if you want captains to
                see your profile for Season 04. Uncheck it if you&apos;re only
                setting up an account for now.
              </p>
            </div>
          </div>
        </label>
      )}

      <Field
        label="Tracker profile URL"
        htmlFor="tracker_url"
        hint={
          <>
            We use this to pull updated ranks later. Find it on{' '}
            <a
              href="https://rocketleague.tracker.network"
              target="_blank"
              rel="noreferrer"
              className="text-thl-orange underline"
            >
              rocketleague.tracker.network
            </a>
            .
          </>
        }
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
          hint="Any season, any playlist. Be honest."
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

      <div className="flex flex-col items-stretch gap-3 border-t border-neutral-200 pt-2 sm:items-end dark:border-neutral-800">
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="h-12 rounded-xl bg-thl-orange px-6 text-sm font-extrabold text-black shadow-[0_14px_35px_-18px_rgba(247,97,3,0.9)] hover:bg-thl-orange-deep sm:min-w-64"
        >
          {pending ? pendingLabel : effectiveSubmitLabel}
          {!pending && <ArrowRight className="h-4 w-4" />}
        </Button>
        <p className="max-w-sm text-right text-xs text-neutral-500">
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
