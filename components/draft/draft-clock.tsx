"use client";

import { useCallback, useState } from "react";

/**
 * Live pick countdown. The value isn't derived in a `useEffect`; instead a
 * ref-callback (React 19, with cleanup) starts a 4Hz interval only while the
 * node is mounted, nudging a `now` tick. Remaining time is computed from props.
 *
 * - Live: counts down from `endsAt`.
 * - Paused: shows the frozen `pausedRemainingMs`, no ticking.
 */
export function DraftClock({
  endsAt,
  paused = false,
  pausedRemainingMs = null,
  totalSeconds = 60,
  className = "",
}: {
  endsAt: string | null;
  paused?: boolean;
  pausedRemainingMs?: number | null;
  totalSeconds?: number;
  className?: string;
}) {
  // `now` is sourced from the interval (a callback, not render) to keep render
  // pure — the lint rule forbids calling Date.now() during render.
  const [now, setNow] = useState<number | null>(null);

  const ticker = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      setNow(Date.now());
      if (paused) return;
      const id = setInterval(() => setNow(Date.now()), 250);
      return () => clearInterval(id);
    },
    [paused],
  );

  const remainingMs = paused
    ? Math.max(0, pausedRemainingMs ?? 0)
    : endsAt && now !== null
      ? Math.max(0, Date.parse(endsAt) - now)
      : // No end time yet (clock not started / "on deck") → show the full
        // duration, ready to run, rather than 0:00.
        totalSeconds * 1000;

  const secs = Math.ceil(remainingMs / 1000);
  const mm = Math.floor(secs / 60);
  const ss = secs % 60;
  const label = `${mm}:${ss.toString().padStart(2, "0")}`;

  const frac = totalSeconds > 0 ? Math.min(1, remainingMs / (totalSeconds * 1000)) : 0;
  const danger = !paused && remainingMs <= 10_000;

  return (
    <div ref={ticker} className={className}>
      <div
        className={`font-extrabold tracking-tight tabular-nums leading-none ${
          danger ? "text-red-500" : "text-white"
        } ${paused ? "opacity-60" : ""}`}
      >
        {label}
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-linear motion-reduce:transition-none ${
            danger ? "bg-red-500" : "bg-thl-orange"
          }`}
          style={{ width: `${frac * 100}%` }}
        />
      </div>
    </div>
  );
}
