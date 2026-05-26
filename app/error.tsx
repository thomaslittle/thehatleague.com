"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, DiscordIcon } from "@/components/icons/brand";
import { SITE } from "@/lib/site";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section
      id="main"
      className="relative min-h-[calc(100vh-6rem)] overflow-hidden bg-white text-neutral-900 dark:bg-black dark:text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(247,97,3,0.22), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-6 py-24 text-center md:px-10 md:py-32">
        <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
          It's windy
        </div>
        <h1 className="mt-5 text-5xl leading-[0.95] font-bold tracking-[-0.04em] md:text-6xl">
          There goes the{" "}
          <span className="font-marker font-normal text-thl-orange">
            hat.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-neutral-600 dark:text-neutral-400">
          Sorry — something on our end didn&apos;t cooperate. Try again, or
          hop into the Discord and someone will pick it up.
        </p>
        {error.digest && (
          <p className="mx-auto mt-3 max-w-md font-mono text-xs text-neutral-400">
            ref · {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3.5 font-bold text-black transition hover:bg-thl-orange-deep"
          >
            Try again
            <ArrowRight className="h-4 w-4" />
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-5 py-3.5 font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
          >
            Back to home
          </Link>
          <a
            href={SITE.discordInvite}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-5 py-3.5 font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
          >
            <DiscordIcon className="h-5 w-5" />
            Ping us
          </a>
        </div>
      </div>
    </section>
  );
}
