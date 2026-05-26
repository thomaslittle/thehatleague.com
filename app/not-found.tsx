import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { ArrowRight, DiscordIcon } from "@/components/icons/brand";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Lost in the parking lot",
};

export default function NotFound() {
  return (
    <PageShell>
      <section className="relative overflow-hidden">
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
            404 · Lost in the parking lot
          </div>
          <h1 className="mt-5 text-6xl leading-[0.95] font-bold tracking-[-0.04em] md:text-7xl">
            That page took a{" "}
            <span className="font-marker font-normal text-thl-orange">
              demo.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-neutral-600 dark:text-neutral-400">
            We couldn&apos;t find what you were looking for. Try the front
            page, or hop into the Discord and someone will point you the
            right way.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3.5 font-bold text-black transition hover:bg-thl-orange-deep"
            >
              Back to home
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={SITE.discordInvite}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-5 py-3.5 font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
            >
              <DiscordIcon className="h-5 w-5" />
              Ask in Discord
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
