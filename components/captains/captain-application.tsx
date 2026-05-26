"use client";

import { useActionState, useState } from "react";
import { ArrowRight, CheckIcon } from "@/components/icons/brand";
import {
  applyForCaptain,
  withdrawCaptainApplication,
  type CaptainApplicationState,
} from "@/app/actions/captain";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  CAPTAIN_PITCH_MAX as PITCH_MAX,
  CAPTAIN_PITCH_MIN as PITCH_MIN,
} from "@/lib/captain";

export function CaptainApplication({
  alreadyApplied,
  initialPitch,
  isCaptain,
}: {
  alreadyApplied: boolean;
  initialPitch: string;
  isCaptain: boolean;
}) {
  const [state, action, pending] = useActionState<
    CaptainApplicationState | undefined,
    FormData
  >(applyForCaptain, undefined);
  const [pitch, setPitch] = useState(initialPitch);
  const tooShort = pitch.length > 0 && pitch.length < PITCH_MIN;
  const tooLong = pitch.length > PITCH_MAX;
  const counterTone = tooLong
    ? "text-rose-500"
    : tooShort
      ? "text-amber-600 dark:text-amber-400"
      : "text-neutral-500";

  if (isCaptain) {
    return (
      <div className="rounded-3xl border border-thl-orange/30 bg-thl-orange/10 p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-thl-orange text-black">
            <CheckIcon className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              You&apos;re confirmed
            </div>
            <div className="text-xl font-bold">
              You&apos;re a Season 4 captain.
            </div>
          </div>
        </div>
        <p className="mt-4 text-neutral-700 dark:text-neutral-300">
          You&apos;ll be in the #captains channel for draft prep and roster
          comms. Watch for the pre-draft DM with the pick order.
        </p>
      </div>
    );
  }

  if (state?.ok || alreadyApplied) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-thl-orange text-black">
            <CheckIcon className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Application received
            </div>
            <div className="text-xl font-bold">
              We&apos;ll DM you on Discord.
            </div>
          </div>
        </div>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          League ops reviews captain applications a couple of times a week.
          You&apos;ll get a Discord DM when you&apos;re in. Changed your mind?
        </p>
        <form action={withdrawCaptainApplication} className="mt-4">
          <Button type="submit" variant="destructive" size="sm">
            Withdraw application
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950"
    >
      <div className="text-xs font-bold tracking-[0.18em] text-thl-orange uppercase">
        Captain application
      </div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">
        Why you, and how you&apos;d pick.
      </h2>

      <div className="mt-5">
        <Field
          label="Your pitch"
          htmlFor="pitch"
          hint={`3–4 sentences. Min ${PITCH_MIN} characters. League ops reads everything.`}
        >
          <Textarea
            id="pitch"
            name="pitch"
            rows={6}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            required
            minLength={PITCH_MIN}
            maxLength={PITCH_MAX}
            invalid={tooLong}
            placeholder="Past seasons, how you'd pick chemistry vs. raw rank, what your weeknight availability looks like…"
          />
        </Field>
        <div className="mt-1.5 flex justify-end">
          <span className={`text-xs tabular-nums ${counterTone}`}>
            {pitch.length}/{PITCH_MAX}
          </span>
        </div>
      </div>

      {state?.error && (
        <p className="mt-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {state.error}
        </p>
      )}

      <div className="mt-5">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Sending…" : "Apply to captain"}
          {!pending && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
}
