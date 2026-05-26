import Image from "next/image";
import Link from "next/link";
import { ArrowRight, TwitchIcon } from "@/components/icons/brand";
import { SITE } from "@/lib/site";

export function Manifesto() {
  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(247,97,3,0.28), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 py-20 md:px-12 md:py-28 lg:py-32">
        <div className="mb-12 flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase sm:gap-4 sm:text-xs sm:tracking-[0.32em] md:mb-16">
          <span className="h-px w-6 shrink-0 bg-thl-orange/60 sm:w-12" />
          <span className="whitespace-nowrap">Draft date · Announced soon</span>
          <span className="h-px w-6 shrink-0 bg-thl-orange/60 sm:w-12" />
        </div>

        <div className="grid items-center gap-12 md:gap-16 lg:grid-cols-[auto_1fr] lg:gap-20">
          <div className="relative flex shrink-0 justify-center lg:justify-start">
            <div
              aria-hidden
              className="absolute inset-0 -m-12 rounded-full opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(247,97,3,0.5), transparent 60%)",
              }}
            />
            <Image
              src="/brand/thl-logo.png"
              alt="The Hat League"
              width={520}
              height={520}
              className="relative aspect-square w-[280px] drop-shadow-[0_20px_60px_rgba(247,97,3,0.4)] sm:w-[340px] md:w-[400px] lg:w-[440px]"
            />
          </div>

          <div className="flex min-w-0 flex-col text-center lg:text-left">
            <p
              className="font-marker leading-[0.95] tracking-tight whitespace-nowrap text-thl-orange"
              style={{ fontSize: "clamp(30px, 9vw, 104px)" }}
            >
              More than mid!
            </p>
            <p
              className="mt-2 font-marker leading-[0.95] tracking-tight whitespace-nowrap text-white"
              style={{ fontSize: "clamp(30px, 9vw, 104px)" }}
            >
              Less than pro!
            </p>
            <p
              className="mt-10 font-marker leading-none tracking-tight whitespace-nowrap text-white/85 md:mt-14 lg:mt-16"
              style={{ fontSize: "clamp(22px, 6.5vw, 72px)" }}
            >
              This is Rocket League!
            </p>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl text-center md:mt-20">
          <p className="text-lg leading-relaxed text-neutral-300 md:text-xl">
            One night. Live chat captains. Teams formed live on stream. A
            season that ends with someone wearing the hat.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center">
            <a
              href={SITE.twitchUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#9146ff] px-6 py-4 text-base font-bold whitespace-nowrap text-white shadow-[0_10px_40px_-12px_rgba(145,70,255,0.6)] transition hover:bg-[#7c2bff] active:scale-[0.98] sm:w-auto"
            >
              <TwitchIcon className="h-5 w-5" />
              Watch the draft on Twitch
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/signin"
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 px-5 py-4 text-base font-semibold whitespace-nowrap text-white transition hover:border-thl-orange hover:text-thl-orange sm:w-auto"
            >
              Put your hat in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
