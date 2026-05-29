import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, DiscordIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { ogMeta } from "@/lib/og";
import { getAnnouncementBySlug } from "@/server/announcements";

const DISCORD_INVITE = "https://discord.gg/6KAYkCkzJH";

export const Route = createFileRoute("/announcements/$slug")({
  loader: async ({ params }) => {
    const announcement = await getAnnouncementBySlug({
      data: { slug: params.slug },
    });
    if (!announcement) throw notFound();
    return { announcement };
  },
  notFoundComponent: NotFound,
  component: AnnouncementPage,
  head: ({ loaderData }) => {
    const a = loaderData?.announcement;
    if (!a) {
      return {
        meta: [{ title: "Announcement · The Hat League" }],
      };
    }
    return {
      meta: ogMeta({
        title: `${a.title} · The Hat League`,
        description: a.body.slice(0, 200),
        eyebrow: a.pinned ? "Pinned · League ops" : "League ops",
        subtitle: a.body.slice(0, 140),
        dynamic: true,
      }),
    };
  },
});

function AnnouncementPage() {
  const { announcement: a } = Route.useLoaderData();
  const published = a.published_at ? new Date(a.published_at) : null;

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="flex-1">
        <section className="relative">
          <div className="mx-auto max-w-[760px] px-6 py-12 md:px-10 md:py-16">
            <Link
              to="/announcements"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-thl-orange underline-offset-4 hover:underline"
            >
              ← All announcements
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-[0.22em] uppercase">
              {a.pinned && (
                <span className="rounded-md bg-thl-orange px-1.5 py-0.5 text-black">
                  Pinned
                </span>
              )}
              <span className="text-thl-orange">
                {published?.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }) ?? ""}
              </span>
            </div>
            <h1 className="mt-3 text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl">
              {a.title}
            </h1>

            <div className="mt-8 grid gap-5 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
              {a.body.split(/\n\s*\n/).map((paragraph, i) => (
                <p key={i} className="whitespace-pre-line">
                  {paragraph.trim()}
                </p>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap gap-3 border-t border-neutral-200 pt-8 dark:border-neutral-800">
              <Link
                to="/announcements"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-5 py-3 font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
              >
                More announcements
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-5 py-3 font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
              >
                <DiscordIcon className="h-4 w-4" />
                Discuss in Discord
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main className="flex flex-1 items-center justify-center px-6 py-20 text-center">
        <div>
          <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
            Not found
          </div>
          <h1 className="mt-4 font-marker text-5xl">No such announcement.</h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Either it&apos;s unpublished or the slug changed.
          </p>
          <Link
            to="/announcements"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3 font-bold text-black transition hover:bg-thl-orange-deep"
          >
            All announcements <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
