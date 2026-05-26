import Link from "next/link";
import { ArrowRight, DiscordIcon } from "@/components/icons/brand";
import { SITE } from "@/lib/site";

export function FinalCta() {
  return (
    <section className="border-y border-neutral-200 bg-neutral-100/70 dark:border-neutral-900 dark:bg-neutral-950">
      <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-10 md:py-24">
        <div className="grid items-center gap-10 rounded-3xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-100 p-10 shadow-sm md:grid-cols-[1.2fr_1fr] md:p-14 dark:border-neutral-800 dark:from-neutral-900 dark:to-black">
          <div>
            <div className="mb-4 text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
              Draft date · Announced soon
            </div>
            <h2 className="text-4xl leading-[1.02] font-bold tracking-[-0.03em] text-neutral-900 md:text-5xl lg:text-6xl dark:text-white">
              You&apos;ve still got time
              <br />
              to{" "}
              <span className="font-marker font-normal text-thl-orange">
                get your hat in.
              </span>
            </h2>
          </div>
          <div className="flex flex-col gap-4 md:items-end">
            <Link
              href="/signin"
              className="inline-flex items-center gap-3 rounded-xl bg-thl-orange px-6 py-4 text-base font-bold whitespace-nowrap text-black transition hover:bg-thl-orange-deep active:scale-[0.98]"
            >
              <DiscordIcon className="h-5 w-5" />
              Sign up with Discord
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={SITE.discordInvite}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 transition hover:text-thl-orange dark:text-neutral-300 dark:hover:text-thl-orange"
            >
              <DiscordIcon className="h-4 w-4" />
              or just come hang out in Discord →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
