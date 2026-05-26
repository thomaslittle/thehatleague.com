import { Suspense } from "react";
import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { ArrowRight, DiscordIcon } from "@/components/icons/brand";
import { SITE } from "@/lib/site";
import { getClips } from "@/lib/discord/clips";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ClipCard } from "@/components/landing/clips";

export const metadata = {
  title: "Clips & Highlights",
  description:
    "Every clip from the THL Discord — sortable, playable, linked to player profiles.",
};

export default function ClipsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Clips & highlights"
        title="The plays."
        accent="Caught on tape."
        subtitle={
          <>
            Live from{" "}
            <span className="inline-flex items-center gap-1.5 align-middle font-semibold text-neutral-900 dark:text-white">
              <DiscordIcon className="h-4 w-4" /> #clips-and-highlights
            </span>
            . Drop a clip in the channel; it lands here within five minutes.
          </>
        }
        actions={
          <a
            href={SITE.discordInvite}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3.5 font-bold text-white transition hover:bg-[#4752c4]"
          >
            <DiscordIcon className="h-5 w-5" />
            Post a clip
            <ArrowRight className="h-4 w-4" />
          </a>
        }
      />

      <Suspense fallback={<ClipsGridSkeleton />}>
        <ClipsGrid />
      </Suspense>
    </PageShell>
  );
}

async function ClipsGrid() {
  const [clips, supabase] = await Promise.all([
    getClips(),
    createSupabaseServerClient(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="mx-auto max-w-[1320px] px-6 pb-16 md:px-10 md:pb-24">
      {clips.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 md:p-12 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
            No clips yet
          </div>
          <h2 className="mt-3 font-marker text-3xl md:text-4xl">
            Be the first to post one.
          </h2>
          <p className="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
            Once captains start dropping clips in{" "}
            <span className="font-semibold">#clips-and-highlights</span>{" "}
            on the Discord, the whole grid populates automatically.
          </p>
          <Link
            href="/signin"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3 text-sm font-bold text-black hover:bg-thl-orange-deep"
          >
            Join the Discord
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {clips.map((c) => (
            <ClipCard key={c.id} clip={c} isAuthenticated={!!user} />
          ))}
        </div>
      )}
    </section>
  );
}

function ClipsGridSkeleton() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 pb-16 md:px-10 md:pb-24">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="aspect-video animate-pulse bg-neutral-200/80 dark:bg-neutral-800/80" />
            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="h-8 w-14 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
