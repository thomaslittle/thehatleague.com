import { Link } from "@tanstack/react-router";
import { ArrowRight, DiscordIcon } from "@/components/icons";

const DISCORD_INVITE = "https://discord.gg/6KAYkCkzJH";

export function SignupCallout() {
  return (
    <section
      id="signup"
      className="relative border-y border-neutral-200 bg-neutral-100/70 dark:border-neutral-900 dark:bg-neutral-950/70"
    >
      <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-28">
        <div className="mb-10 grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-3 text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
              How it works
            </div>
            <h2 className="text-4xl leading-[0.98] font-bold tracking-[-0.03em] text-neutral-900 md:text-5xl lg:text-6xl dark:text-white">
              Two steps.{" "}
              <span className="font-marker font-normal text-thl-orange">
                Then we play.
              </span>
            </h2>
          </div>
          <Link
            to="/rules"
            className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-thl-orange underline-offset-4 hover:underline"
          >
            Full ruleset <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="grid grid-cols-2 border-b border-neutral-200 dark:border-neutral-800">
            <StepHead n={1} label="Connect Discord" />
            <StepHead n={2} label="Add your tracker" />
          </div>

          <div className="p-8 md:p-10">
            <div className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
              <div>
                <p className="text-xs font-bold tracking-[0.22em] text-thl-orange uppercase">
                  Step 01
                </p>
                <h3 className="mt-3 font-marker text-3xl text-neutral-900 md:text-4xl dark:text-white">
                  Hat in the ring.
                </h3>
                <p className="mt-4 leading-relaxed text-neutral-600 dark:text-neutral-400">
                  We use Discord for everything — scheduling, captain comms,
                  draft pings. One click links your account so captains know
                  who they&apos;re picking.
                </p>
                <Link
                  to="/signin"
                  className="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#5865F2] px-5 py-3.5 font-semibold text-white transition hover:bg-[#4752c4] active:scale-[0.98]"
                >
                  <DiscordIcon className="h-5 w-5" />
                  Connect Discord
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-4 text-xs text-neutral-500">
                  Step 2 — we&apos;ll ask for your{" "}
                  <span className="inline-flex items-center gap-1 font-semibold text-neutral-900 dark:text-neutral-100">
                    rocketleague.tracker.network
                  </span>{" "}
                  profile after sign-in.
                </p>
              </div>
              <PreviewCard />
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-500">
          Stuck or have questions? Hop into the{" "}
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener"
            className="font-semibold text-thl-orange underline-offset-4 hover:underline"
          >
            #help channel on Discord
          </a>{" "}
          — someone&apos;s always around.
        </p>
      </div>
    </section>
  );
}

function StepHead({ n, label }: { n: 1 | 2; label: string }) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2.5 px-3 py-4 sm:gap-3 sm:px-6 md:px-8 ${
        n === 1
          ? "bg-neutral-50 dark:bg-neutral-900"
          : "border-l border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition sm:h-8 sm:w-8 sm:text-sm ${
          n === 1
            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            : "bg-neutral-200 text-neutral-500 dark:bg-neutral-800"
        }`}
      >
        {String(n).padStart(2, "0")}
      </div>
      <div className="min-w-0">
        <div className="truncate text-[9px] font-bold tracking-[0.18em] text-thl-orange uppercase sm:text-[10px] sm:tracking-[0.22em]">
          Step {n}
        </div>
        <div className="truncate text-xs font-semibold text-neutral-900 sm:text-sm dark:text-white">
          {label}
        </div>
      </div>
    </div>
  );
}

function PreviewCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/60 p-6 dark:border-neutral-700 dark:bg-neutral-900/40">
      <div className="mb-4 text-[10px] font-bold tracking-[0.22em] text-neutral-400 uppercase dark:text-neutral-600">
        Captain&apos;s view · preview
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thl-orange font-bold text-black">
          HD
        </div>
        <div>
          <div className="text-sm font-bold text-neutral-900 dark:text-white">
            your_handle
          </div>
          <div className="text-xs text-neutral-500">
            Discord verified · joined just now
          </div>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        {(
          [
            ["2v2 Rank", "Diamond II · Div 3"],
            ["3v3 Rank", "Diamond I · Div 4"],
            ["Peak (S24)", "Champ I · Div 2"],
            ["Recent form", "12W · 7L (last 30d)"],
          ] as const
        ).map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between border-b border-neutral-200/70 py-1.5 text-sm last:border-0 dark:border-neutral-800/70"
          >
            <span className="text-neutral-500 dark:text-neutral-400">{k}</span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
