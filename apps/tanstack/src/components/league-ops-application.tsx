import { useState, useTransition } from "react";
import { ArrowRight } from "@/components/icons";
import {
  applyForLeagueOps,
  withdrawLeagueOpsApplication,
} from "@/server/auth";

const PITCH_MIN = 40;
const PITCH_MAX = 1200;

export function LeagueOpsApplication({
  alreadyApplied,
  initialPitch,
}: {
  alreadyApplied: boolean;
  initialPitch: string;
}) {
  const [submitted, setSubmitted] = useState(alreadyApplied);
  const [pitch, setPitch] = useState(initialPitch);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const tooShort = pitch.length > 0 && pitch.length < PITCH_MIN;
  const tooLong = pitch.length > PITCH_MAX;
  const counterTone = tooLong
    ? "text-rose-500"
    : tooShort
      ? "text-amber-600 dark:text-amber-400"
      : "text-neutral-500";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await applyForLeagueOps({ data: { pitch } });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(res.message);
      }
    });
  }

  function onWithdraw() {
    setError(null);
    startTransition(async () => {
      const res = await withdrawLeagueOpsApplication();
      if (res.ok) {
        setSubmitted(false);
      } else {
        setError(res.message);
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-thl-orange text-black">
            ✓
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
        {error && (
          <p role="alert" className="mt-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={onWithdraw}
          disabled={pending}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
        >
          {pending ? "Withdrawing…" : "Withdraw application"}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950"
    >
      <div className="text-xs font-bold tracking-[0.18em] text-thl-orange uppercase">
        League ops application
      </div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">
        What you&apos;d help with.
      </h2>

      <div className="mt-5">
        <label
          htmlFor="admin-pitch"
          className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
        >
          Your pitch
        </label>
        <p className="mt-1 text-xs text-neutral-500">
          3–4 sentences. Min {PITCH_MIN} characters. A current admin reads
          everything.
        </p>
        <textarea
          id="admin-pitch"
          name="pitch"
          rows={6}
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          required
          minLength={PITCH_MIN}
          maxLength={PITCH_MAX}
          placeholder="What you bring — past seasons, code/infra/Discord-bot chops, on-call availability during draft nights, anything that makes you a fit…"
          className={
            "mt-2 block w-full rounded-xl border bg-white px-3 py-2 text-sm leading-relaxed shadow-sm transition focus:border-thl-orange focus:outline-none focus:ring-2 focus:ring-thl-orange/40 dark:bg-neutral-950 " +
            (tooLong
              ? "border-rose-400"
              : "border-neutral-300 dark:border-neutral-700")
          }
        />
        <div className="mt-1.5 flex justify-end">
          <span className={`text-xs tabular-nums ${counterTone}`}>
            {pitch.length}/{PITCH_MAX}
          </span>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}

      <div className="mt-5">
        <button
          type="submit"
          disabled={pending || tooShort || tooLong || pitch.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3 text-sm font-extrabold text-black transition hover:bg-thl-orange-deep disabled:opacity-50"
        >
          {pending ? "Sending…" : "Apply to league ops"}
          {!pending && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}
