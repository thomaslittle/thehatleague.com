import Image from "next/image";
import Link from "next/link";
import { readThemePref } from "@/lib/theme";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { ArrowRight, DiscordIcon } from "@/components/icons/brand";
import { signInWithDiscord } from "@/app/actions/auth";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Sign in",
};

export default async function SignInPage(props: PageProps<"/signin">) {
  const theme = await readThemePref();
  const sp = await props.searchParams;
  const redirectParam =
    typeof sp.redirect === "string" ? sp.redirect : "/dashboard";
  const error = typeof sp.error === "string" ? sp.error : null;

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-black dark:text-white">
      <SiteHeader theme={theme} showSignup={false} />
      <main id="main" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at 50% 20%, rgba(247,97,3,0.20), transparent 60%)",
          }}
        />
        <div className="relative mx-auto grid max-w-[1100px] gap-12 px-6 py-16 md:grid-cols-[1.05fr_1fr] md:gap-16 md:px-10 md:py-24">
          <div>
            <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
              Sign in · Season 04
            </div>
            <h1 className="mt-4 text-5xl leading-[0.95] font-bold tracking-[-0.04em] text-neutral-900 md:text-6xl dark:text-white">
              Hat in the ring.
              <br />
              <span className="font-marker font-normal text-thl-orange">
                One click.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-neutral-600 dark:text-neutral-400">
              Discord is the only door. We use it for draft pings, captain
              comms, and matchup scheduling. After you sign in we&apos;ll ask
              for your tracker profile so captains know what they&apos;re
              picking.
            </p>

            <form action={signInWithDiscord} className="mt-9">
              <input type="hidden" name="redirect" value={redirectParam} />
              <button
                type="submit"
                className="inline-flex items-center gap-3 rounded-xl bg-[#5865F2] px-6 py-4 text-base font-bold whitespace-nowrap text-white shadow-[0_10px_40px_-12px_rgba(88,101,242,0.6)] transition hover:bg-[#4752c4] active:scale-[0.98]"
              >
                <DiscordIcon className="h-5 w-5" />
                Continue with Discord
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {error && (
              <p className="mt-5 inline-block rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                Sign-in failed: {error}. Please try again or hop into{" "}
                <a
                  href={SITE.discordInvite}
                  className="underline underline-offset-4"
                  target="_blank"
                  rel="noopener"
                >
                  the Discord
                </a>{" "}
                for help.
              </p>
            )}

            <ul className="mt-10 grid max-w-md gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-thl-orange" />
                Auto-creates your profile from Discord identity.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-thl-orange" />
                Drops you into the Season 4 player pool.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-thl-orange" />
                Captains pick from this pool live on stream.
              </li>
            </ul>

            <p className="mt-10 text-xs text-neutral-500">
              By signing in you agree to abide by the{" "}
              <Link href="/rules" className="underline underline-offset-4">
                league rules and code of conduct
              </Link>
              .
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative aspect-square w-full max-w-[420px]">
              <div
                aria-hidden
                className="absolute inset-0 -m-10 rounded-full opacity-50 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(247,97,3,0.55), transparent 60%)",
                }}
              />
              <Image
                src="/brand/thl-logo.png"
                alt="The Hat League"
                width={520}
                height={520}
                priority
                className="relative drop-shadow-[0_20px_60px_rgba(247,97,3,0.4)]"
              />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
