import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { ArrowRight, DiscordIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { startDiscordOAuth } from "@/server/auth";

const DISCORD_INVITE = "https://discord.gg/6KAYkCkzJH";

export const Route = createFileRoute("/signin")({
  component: SigninPage,
  validateSearch: (search: Record<string, unknown>) => {
    const out: { redirect?: string; error?: string } = {};
    if (typeof search.redirect === "string") {
      // Sanitize at the boundary so the same-origin path can never carry
      // a protocol-relative URL or backslash-host bypass.
      const safe = safeRedirectPath(search.redirect, "");
      if (safe) out.redirect = safe;
    }
    if (typeof search.error === "string") out.error = search.error;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Sign in · The Hat League" },
      {
        name: "description",
        content:
          "Sign in to The Hat League with Discord. We use Discord for identity, draft pings, and captain comms.",
      },
    ],
  }),
});

function SigninPage() {
  const { redirect, error: paramError } = Route.useSearch();
  const [error, setError] = useState<string | null>(paramError ?? null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await startDiscordOAuth({
        data: { redirect: redirect ?? "/dashboard" },
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      window.location.assign(result.url);
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="relative flex-1 overflow-hidden">
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

            <form onSubmit={onSubmit} className="mt-9">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-3 rounded-xl bg-[#5865F2] px-6 py-4 text-base font-bold whitespace-nowrap text-white shadow-[0_10px_40px_-12px_rgba(88,101,242,0.6)] transition hover:bg-[#4752c4] active:scale-[0.98] disabled:opacity-60"
              >
                <DiscordIcon className="h-5 w-5" />
                {pending ? "Redirecting…" : "Continue with Discord"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {error && (
              <p className="mt-5 inline-block rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                Sign-in failed: {error}. Please try again or hop into{" "}
                <a
                  href={DISCORD_INVITE}
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
              <Link to="/rules" className="underline underline-offset-4">
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
              <img
                src="/brand/thl-logo.png"
                alt="The Hat League"
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
