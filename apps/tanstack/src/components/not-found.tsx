import { Link } from "@tanstack/react-router";
import { ArrowRight, DiscordIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";

const DISCORD_INVITE = "https://discord.gg/6KAYkCkzJH";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(247,97,3,0.22), transparent 60%)",
            }}
          />
          <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-6 py-20 md:px-10 md:py-28 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
                404 · There goes the hat
              </div>
              <h1 className="mt-5 text-5xl leading-[0.95] font-bold tracking-[-0.04em] md:text-6xl lg:text-7xl">
                That page took a{" "}
                <span className="font-marker font-normal text-thl-orange">
                  demo.
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-md text-lg text-neutral-600 lg:mx-0 dark:text-neutral-400">
                Couldn&apos;t find what you were looking for. Try the front
                page, or hop into the Discord and someone will point you the
                right way.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3.5 font-bold text-black transition hover:bg-thl-orange-deep"
                >
                  Back to home
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-5 py-3.5 font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
                >
                  <DiscordIcon className="h-5 w-5" />
                  Ask in Discord
                </a>
              </div>
            </div>

            <figure className="relative">
              <div
                aria-hidden
                className="absolute inset-0 -m-8 rounded-full opacity-70 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(247,97,3,0.45), transparent 60%)",
                }}
              />
              <div className="relative overflow-hidden rounded-3xl border-2 border-thl-orange/30 bg-black shadow-[0_30px_80px_-20px_rgba(247,97,3,0.45)]">
                <img
                  src="/brand/there-goes-the-hat.gif"
                  alt="Weather reporter losing his hat to a hurricane gust — exactly how this URL is feeling right now."
                  className="block h-auto w-full"
                />
                <figcaption className="absolute right-0 bottom-0 left-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-5 py-4 text-xs font-bold tracking-[0.18em] text-white/90 uppercase">
                  <span>Live · Doppler</span>
                  <span className="text-thl-orange">404</span>
                </figcaption>
              </div>
            </figure>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
