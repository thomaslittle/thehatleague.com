import {
  createFileRoute,
  Link,
  notFound,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { SiteFooter } from "@/components/site-footer";
import { getViewer } from "@/server/auth";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAdminAnnouncements,
  togglePinAnnouncement,
  type AdminAnnouncement,
} from "@/server/admin";
import { AdminTabs } from "./admin";

export const Route = createFileRoute("/admin/announcements")({
  beforeLoad: async () => {
    const viewer = await getViewer();
    if (!viewer) {
      throw redirect({
        to: "/signin",
        search: { redirect: "/admin/announcements" },
      });
    }
    if (!viewer.isAdmin) throw notFound();
    return { viewer };
  },
  loader: async () => {
    const items = await getAdminAnnouncements();
    if (!items) throw notFound();
    return items;
  },
  component: AdminAnnouncementsPage,
  head: () => ({
    meta: [
      { title: "Admin · Announcements · The Hat League" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminAnnouncementsPage() {
  const items = Route.useLoaderData();

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="flex-1">
        <AdminTabs current="announcements" />
        <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
          <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
            Announcements
          </div>
          <h1 className="mt-3 text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl">
            From league ops,{" "}
            <span className="font-marker font-normal text-thl-orange">
              straight up.
            </span>
          </h1>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h2 className="text-xl font-bold tracking-tight">All posts</h2>
              {items.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-8 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
                  No announcements yet.
                </p>
              ) : (
                <ul className="mt-4 grid gap-3">
                  {items.map((a) => (
                    <AnnouncementRow key={a.id} row={a} />
                  ))}
                </ul>
              )}
            </div>

            <Composer />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function AnnouncementRow({ row }: { row: AdminAnnouncement }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const isLive = !!row.published_at;
  const date = row.published_at
    ? new Date(row.published_at)
    : new Date(row.created_at);

  function togglePin() {
    start(async () => {
      await togglePinAnnouncement({
        data: { id: row.id, nextPinned: !row.pinned },
      });
      router.invalidate();
    });
  }
  function onDelete() {
    if (!confirm(`Delete "${row.title}"? This can't be undone.`)) return;
    start(async () => {
      await deleteAnnouncement({ data: { id: row.id } });
      router.invalidate();
    });
  }

  return (
    <li className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase">
          {row.pinned && (
            <span className="rounded-md bg-thl-orange px-1.5 py-0.5 text-black">
              Pinned
            </span>
          )}
          <span className={isLive ? "text-thl-orange" : "text-neutral-400"}>
            {isLive ? "Live" : "Draft"} · {date.toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePin}
            disabled={pending}
            className="rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-500 transition hover:border-thl-orange hover:text-thl-orange disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-400"
          >
            {row.pinned ? "Unpin" : "Pin"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-500 transition hover:border-rose-400 hover:text-rose-500 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-400"
          >
            Delete
          </button>
        </div>
      </div>
      <h3 className="mt-2 text-lg font-bold tracking-tight">{row.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {row.body}
      </p>
      {isLive && (
        <Link
          to="/announcements/$slug"
          params={{ slug: row.slug }}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          View public page →
        </Link>
      )}
    </li>
  );
}

function Composer() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<"published" | "draft" | null>(null);
  const [pending, start] = useTransition();

  function submit(isPublishing: boolean) {
    setError(null);
    setSaved(null);
    start(async () => {
      const r = await createAnnouncement({
        data: { title, body, pinned, isPublishing },
      });
      if (!r.ok) {
        setError(r.message);
        return;
      }
      setSaved(isPublishing ? "published" : "draft");
      setTitle("");
      setBody("");
      setPinned(false);
      router.invalidate();
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(true);
      }}
      className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950"
    >
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        New announcement
      </div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">
        Tell the league.
      </h2>

      <label className="mt-5 block">
        <span className="text-xs font-bold tracking-[0.18em] text-neutral-500 uppercase">
          Title
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={4}
          maxLength={120}
          placeholder="e.g. Draft night locked — Friday July 19"
          className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-thl-orange focus:ring-1 focus:ring-thl-orange dark:border-neutral-800 dark:bg-black dark:text-white"
        />
      </label>

      <label className="mt-5 block">
        <span className="text-xs font-bold tracking-[0.18em] text-neutral-500 uppercase">
          Body
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={10}
          rows={7}
          placeholder="Plain text — blank lines separate paragraphs."
          className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-thl-orange focus:ring-1 focus:ring-thl-orange dark:border-neutral-800 dark:bg-black dark:text-white"
        />
        <span className="mt-1 block text-xs text-neutral-500">
          Markdown is treated as plain text. Two blank lines = new paragraph.
        </span>
      </label>

      <label className="mt-5 flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={pinned}
          onChange={(e) => setPinned(e.target.checked)}
          className="h-4 w-4 accent-thl-orange"
        />
        <span className="font-bold">Pin to header strip</span>
      </label>

      {error && (
        <p role="alert" className="mt-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}
      {saved && !error && (
        <p role="status" className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {saved === "published" ? "Published live." : "Saved as draft."}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3 font-bold text-black transition hover:bg-thl-orange-deep active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? "Posting…" : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-5 py-3 font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300"
        >
          Save draft
        </button>
      </div>
    </form>
  );
}
