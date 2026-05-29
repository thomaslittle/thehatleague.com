import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { getRecentAnnouncements } from "@/server/announcements";
import { ogMeta } from "@/lib/og";

export const Route = createFileRoute("/announcements")({
  component: AnnouncementsPage,
  loader: () => getRecentAnnouncements({ data: { limit: 30 } }),
  head: () => ({
    meta: ogMeta({ title: "Announcements · The Hat League", description: "League announcements — draft updates, schedule changes, rule tweaks.", dynamic: true }),
    links: [
      {
        rel: "alternate",
        type: "application/atom+xml",
        title: "The Hat League · Announcements",
        href: "/announcements/feed.xml",
      },
    ],
  }),
});

function AnnouncementsPage() {
  const items = Route.useLoaderData();

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="flex-1">
        <PageHero
          eyebrow="Announcements"
          title="From league ops"
          accent="straight up."
          subtitle={
            <>
              Draft updates, schedule changes, rule tweaks. Pinned posts
              stay at the top.
            </>
          }
          actions={
            <a
              href="/announcements/feed.xml"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
            >
              Subscribe (Atom)
            </a>
          }
        />

        <section className="mx-auto max-w-[860px] px-6 pb-24 md:px-10">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center md:p-14 dark:border-neutral-800 dark:bg-neutral-950">
              <h2 className="font-marker text-3xl md:text-4xl">All quiet.</h2>
              <p className="mx-auto mt-3 max-w-md text-neutral-600 dark:text-neutral-400">
                No announcements yet. We&apos;ll post here as Season 4 takes
                shape.
              </p>
            </div>
          ) : (
            <ul className="grid gap-4">
              {items.map((a) => {
                const published = a.published_at
                  ? new Date(a.published_at)
                  : null;
                return (
                  <li key={a.id}>
                    <Link
                      to="/announcements/$slug"
                      params={{ slug: a.slug }}
                      className="group block rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-thl-orange"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase">
                        {a.pinned && (
                          <span className="rounded-md bg-thl-orange px-1.5 py-0.5 text-black">
                            Pinned
                          </span>
                        )}
                        <span className="text-thl-orange">
                          {published?.toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }) ?? ""}
                        </span>
                      </div>
                      <h2 className="mt-2 text-2xl leading-tight font-bold tracking-tight md:text-3xl">
                        {a.title}
                      </h2>
                      <p className="mt-2 line-clamp-3 leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {a.body}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-thl-orange opacity-0 transition group-hover:opacity-100">
                        Read it <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
