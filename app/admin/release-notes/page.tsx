import { Sparkles } from "lucide-react";
import { RELEASE_NOTES, type ReleaseNote } from "@/lib/release-notes";

export const metadata = {
  title: "Release notes",
  robots: { index: false, follow: false },
};

// Admin-gated by app/admin/layout.tsx (requireAdmin).
export default function AdminReleaseNotesPage() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
      <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
        Release notes
      </div>
      <h1 className="mt-3 text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl">
        What&apos;s{" "}
        <span className="font-marker font-normal text-thl-orange">shipped.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-neutral-500 dark:text-neutral-400">
        Every change pushed live to The Hat League, newest first. Visible to
        league ops only.
      </p>

      <div className="mt-10 space-y-8">
        {RELEASE_NOTES.map((release) => (
          <ReleaseCard key={release.version} release={release} />
        ))}
      </div>
    </section>
  );
}

function ReleaseCard({ release }: { release: ReleaseNote }) {
  const date = new Date(`${release.date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-thl-orange/10 blur-3xl"
      />

      <div className="relative flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-thl-orange px-3 py-1 text-xs font-extrabold tracking-wide text-black">
          <Sparkles className="size-3.5" />
          {release.version}
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          {release.title}
        </h2>
        <span className="ml-auto text-xs font-semibold text-neutral-500">
          {date}
        </span>
      </div>

      <p className="relative mt-3 max-w-3xl text-sm leading-relaxed text-neutral-600 md:text-base dark:text-neutral-300">
        {release.summary}
      </p>

      <div className="relative mt-8 grid gap-x-10 gap-y-8 lg:grid-cols-2">
        {release.sections.map((section) => (
          <div key={section.heading}>
            <h3 className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-thl-orange uppercase">
              {section.heading}
              <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            </h3>
            <ul className="mt-3 space-y-2">
              {section.items.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-thl-orange/70"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}
