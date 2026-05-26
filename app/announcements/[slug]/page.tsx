import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page/page-shell";
import { ArrowRight, DiscordIcon } from "@/components/icons/brand";
import { getAnnouncementBySlug } from "@/lib/data/announcements";
import { SITE } from "@/lib/site";

export async function generateMetadata(
  props: PageProps<"/announcements/[slug]">,
) {
  const { slug } = await props.params;
  const a = await getAnnouncementBySlug(slug);
  if (!a) return { title: "Announcement" };
  return {
    title: a.title,
    description: a.body.slice(0, 200),
  };
}

export default async function AnnouncementPage(
  props: PageProps<"/announcements/[slug]">,
) {
  const { slug } = await props.params;
  const a = await getAnnouncementBySlug(slug);
  if (!a) notFound();

  const published = a.published_at ? new Date(a.published_at) : null;

  return (
    <PageShell>
      <section className="relative">
        <div className="mx-auto max-w-[760px] px-6 py-12 md:px-10 md:py-16">
          <Link
            href="/announcements"
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
              href="/announcements"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-5 py-3 font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
            >
              More announcements
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href={SITE.discordInvite}
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
    </PageShell>
  );
}
