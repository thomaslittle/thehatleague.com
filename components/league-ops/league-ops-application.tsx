"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowRight, CheckIcon } from "@/components/icons/brand";
import {
  applyForLeagueOps,
  withdrawLeagueOpsApplication,
  type LeagueOpsApplicationState,
} from "@/app/actions/league-ops";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  ADMIN_PITCH_MAX as PITCH_MAX,
  ADMIN_PITCH_MIN as PITCH_MIN,
} from "@/lib/league-ops";
import { showLeagueToast } from "@/components/ui/league-toast";

export function LeagueOpsApplication({
  alreadyApplied,
  initialPitch,
}: {
  alreadyApplied: boolean;
  initialPitch: string;
}) {
  const [state, action, pending] = useActionState<
    LeagueOpsApplicationState | undefined,
    FormData
  >(applyForLeagueOps, undefined);
  const [pitch, setPitch] = useState(initialPitch);
  const tooShort = pitch.length > 0 && pitch.length < PITCH_MIN;
  const tooLong = pitch.length > PITCH_MAX;
  const counterTone = tooLong
    ? "text-rose-500"
    : tooShort
      ? "text-amber-600 dark:text-amber-400"
      : "text-neutral-500";

  useEffect(() => {
    if (!state?.ok) return;
    showLeagueToast({
      id: "league-ops-application-submitted",
      eyebrow: "Application sent",
      prefix: "League ops application",
      body: "was submitted. A current admin will review it.",
    });
  }, [state?.ok]);

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
          A current admin will review your pitch and DM you when you&apos;re
          in. Changed your mind?
        </p>
        <form action={withdrawLeagueOpsApplication} className="mt-4">
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
        League ops application
      </div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">
        What you&apos;d help with.
      </h2>

      <div className="mt-5">
        <Field
          label="Your pitch"
          htmlFor="admin-pitch"
          hint={`3–4 sentences. Min ${PITCH_MIN} characters. A current admin reads everything.`}
        >
          <Textarea
            id="admin-pitch"
            name="pitch"
            rows={6}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            required
            minLength={PITCH_MIN}
            maxLength={PITCH_MAX}
            invalid={tooLong}
            placeholder="What you bring — past seasons, code/infra/Discord-bot chops, on-call availability during draft nights, anything that makes you a fit…"
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
          {pending ? "Sending…" : "Apply to league ops"}
          {!pending && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
}
