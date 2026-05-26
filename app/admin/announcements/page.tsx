import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  deleteAnnouncement,
  togglePinAnnouncement,
} from "@/app/actions/admin";
import { AnnouncementComposer } from "@/components/admin/announcement-composer";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { parseAdminToastKind } from "@/lib/admin/toast-kinds";

export default async function AdminAnnouncementsPage(
  props: PageProps<"/admin/announcements">,
) {
  const sp = await props.searchParams;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(40);
  const items = data ?? [];

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
      <AdminActionToast kind={parseAdminToastKind(sp.toast)} />
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
              {items.map((a) => {
                const isLive = !!a.published_at;
                const date = a.published_at
                  ? new Date(a.published_at)
                  : new Date(a.created_at);
                return (
                  <li
                    key={a.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase">
                        {a.pinned && (
                          <span className="rounded-md bg-thl-orange px-1.5 py-0.5 text-black">
                            Pinned
                          </span>
                        )}
                        <span
                          className={
                            isLive ? "text-thl-orange" : "text-neutral-400"
                          }
                        >
                          {isLive ? "Live" : "Draft"} ·{" "}
                          {date.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <form action={togglePinAnnouncement}>
                          <input type="hidden" name="id" value={a.id} />
                          {a.pinned && (
                            <input type="hidden" name="pinned" value="on" />
                          )}
                          <button
                            type="submit"
                            className="rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-500 hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
                          >
                            {a.pinned ? "Unpin" : "Pin"}
                          </button>
                        </form>
                        <form action={deleteAnnouncement}>
                          <input type="hidden" name="id" value={a.id} />
                          <button
                            type="submit"
                            className="rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-500 hover:border-rose-400 hover:text-rose-500 dark:border-neutral-700 dark:text-neutral-300"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                    <h3 className="mt-2 text-lg font-bold tracking-tight">
                      <Link
                        href={`/announcements/${a.slug}`}
                        className="hover:text-thl-orange"
                      >
                        {a.title}
                      </Link>
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                      {a.body}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <AnnouncementComposer />
      </div>
    </section>
  );
}
