import Link from "next/link";
import { ArrowRight } from "@/components/icons/brand";

/**
 * Landing-page callout for end-of-season MVP voting. Doesn't open until
 * Season 4 wraps — this lives now so signups know it's coming and to
 * reserve a discoverable hook for when the vote does open.
 */
export function MvpCallout() {
  return (
    <section
      id="mvp"
      className="relative border-t border-neutral-200 bg-white dark:border-neutral-900 dark:bg-black"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 10% 50%, rgba(247,97,3,0.22), transparent 55%)",
        }}
      />
      <div className="relative mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
              MVP vote · Season 04
            </div>
            <h2 className="reveal mt-3 text-4xl leading-[1] font-bold tracking-[-0.02em] md:text-5xl lg:text-6xl">
              Crown the{" "}
              <span className="font-marker font-normal text-thl-orange">
                MVP.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
              At the end of Season 04 every signed-up player gets one vote.
              Pick the dad who shifted the league. Winner gets announced
              live at the Grand Finals.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/mvp"
                className="inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3.5 font-bold text-black transition hover:bg-thl-orange-deep"
              >
                See the candidates
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3.5 py-1.5 text-xs font-bold tracking-[0.18em] text-neutral-600 uppercase dark:border-neutral-700 dark:text-neutral-300">
                <span className="h-1.5 w-1.5 rounded-full bg-thl-orange" />
                Voting opens · TBA
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)] md:p-8 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
                  How it works
                </div>
                <span className="rounded-md bg-thl-orange px-2 py-0.5 text-[10px] font-extrabold tracking-[0.18em] text-black">
                  S04
                </span>
              </div>
              <ol className="mt-4 grid gap-3 text-sm">
                <Step n={1}>
                  Conference Finals end. Voting opens for{" "}
                  <span className="font-semibold text-thl-orange">48 hours</span>.
                </Step>
                <Step n={2}>
                  Every signed-up player gets{" "}
                  <span className="font-semibold">one vote</span>. No multis,
                  no Discord ballot-stuffing.
                </Step>
                <Step n={3}>
                  Top vote-getter is announced live at the Grand Finals stream.
                </Step>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-thl-orange text-xs font-extrabold text-black">
        {n}
      </span>
      <span className="text-neutral-700 dark:text-neutral-300">{children}</span>
    </li>
  );
}
