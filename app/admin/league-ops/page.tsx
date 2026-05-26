import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  approveAdminApplication,
  dismissAdminApplication,
} from "@/app/actions/admin";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { parseAdminToastKind } from "@/lib/admin/toast-kinds";

export default async function AdminLeagueOpsPage(
  props: PageProps<"/admin/league-ops">,
) {
  const sp = await props.searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: pending } = await supabase
    .from("profiles")
    .select(
      "id, discord_username, discord_global_name, discord_avatar_url, admin_pitch, updated_at",
    )
    .eq("is_admin_applicant", true)
    .eq("is_admin", false)
    .order("updated_at", { ascending: false });

  const pendingRows = pending ?? [];

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
      <AdminActionToast kind={parseAdminToastKind(sp.toast)} />
      <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
        League ops applications
      </div>
      <h1 className="mt-3 text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl">
        {pendingRows.length} pending{" "}
        <span className="font-marker font-normal text-thl-orange">
          request{pendingRows.length === 1 ? "" : "s"}.
        </span>
      </h1>
      <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
        Approving promotes the user to admin. To demote an existing admin,
        head to{" "}
        <Link
          href="/admin/players"
          className="font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          /admin/players
        </Link>
        .
      </p>

      <h2 className="mt-12 text-xl font-bold tracking-tight">
        Pending applications
      </h2>
      {pendingRows.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-8 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
          No pending applications.
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {pendingRows.map((p) => {
            const name =
              p.discord_global_name ?? p.discord_username ?? "Unnamed";
            const profileHref = p.discord_username
              ? `/players/${encodeURIComponent(p.discord_username)}`
              : null;
            return (
              <li
                key={p.id}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="flex items-center gap-3">
                  {p.discord_avatar_url ? (
                    <Image
                      src={p.discord_avatar_url}
                      alt=""
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 rounded-full border border-neutral-200 dark:border-neutral-800"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thl-orange font-bold text-black">
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-base font-bold">
                      {profileHref ? (
                        <Link
                          href={profileHref}
                          className="hover:text-thl-orange"
                        >
                          {name}
                        </Link>
                      ) : (
                        name
                      )}
                    </div>
                    <div className="truncate text-xs text-neutral-500">
                      @{p.discord_username ?? "—"}
                    </div>
                  </div>
                </div>

                {p.admin_pitch && (
                  <blockquote className="mt-4 max-h-40 overflow-auto border-l-2 border-thl-orange/40 pl-3 text-sm leading-relaxed text-neutral-700 italic dark:text-neutral-300">
                    &ldquo;{p.admin_pitch}&rdquo;
                  </blockquote>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <form action={approveAdminApplication}>
                    <input type="hidden" name="profile_id" value={p.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-thl-orange px-4 py-2 text-sm font-bold text-black hover:bg-thl-orange-deep"
                    >
                      Approve as admin
                    </button>
                  </form>
                  <form action={dismissAdminApplication}>
                    <input type="hidden" name="profile_id" value={p.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-rose-400 hover:text-rose-500 dark:border-neutral-700 dark:text-neutral-300"
                    >
                      Dismiss
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
