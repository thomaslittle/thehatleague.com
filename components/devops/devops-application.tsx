"use client";

import { useActionState, useState } from "react";
import { ArrowRight, CheckIcon } from "@/components/icons/brand";
import {
  applyForDevops,
  withdrawDevopsApplication,
  type DevopsApplicationState,
} from "@/app/actions/devops";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  DEVOPS_PITCH_MAX as PITCH_MAX,
  DEVOPS_PITCH_MIN as PITCH_MIN,
} from "@/lib/devops";

export function DevopsApplication({
  alreadyApplied,
  initialPitch,
  isDevops,
}: {
  alreadyApplied: boolean;
  initialPitch: string;
  isDevops: boolean;
}) {
  const [state, action, pending] = useActionState<
    DevopsApplicationState | undefined,
    FormData
  >(applyForDevops, undefined);
  const [pitch, setPitch] = useState(initialPitch);
  const tooShort = pitch.length > 0 && pitch.length < PITCH_MIN;
  const tooLong = pitch.length > PITCH_MAX;
  const counterTone = tooLong
    ? "text-rose-500"
    : tooShort
      ? "text-amber-600 dark:text-amber-400"
      : "text-neutral-500";

  if (isDevops) {
    return (
      <div className="rounded-3xl border border-thl-orange/30 bg-thl-orange/10 p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-thl-orange text-black">
            <CheckIcon className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              You&apos;re on the crew
            </div>
            <div className="text-xl font-bold">
              You&apos;re a Season 4 devops contributor.
            </div>
          </div>
        </div>
        <p className="mt-4 text-neutral-700 dark:text-neutral-300">
          You&apos;ll be looped into the #devops channel for repo access,
          deploy comms, and the running task list.
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
          League ops reviews devops applications a couple of times a week.
          You&apos;ll get a Discord DM when you&apos;re in. Changed your mind?
        </p>
        <form action={withdrawDevopsApplication} className="mt-4">
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
        Devops application
      </div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">
        What you&apos;d build, fix, or run.
      </h2>

      <div className="mt-5">
        <Field
          label="Your pitch"
          htmlFor="devops-pitch"
          hint={`3–4 sentences. Min ${PITCH_MIN} characters. League ops reads everything.`}
        >
          <Textarea
            id="devops-pitch"
            name="pitch"
            rows={6}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            required
            minLength={PITCH_MIN}
            maxLength={PITCH_MAX}
            invalid={tooLong}
            placeholder="What you can help with — code contributions, replay pipelines, infra, Discord bots, on-call during draft nights…"
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
          {pending ? "Sending…" : "Apply to devops"}
          {!pending && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
}
