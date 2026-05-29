import {
  createFileRoute,
  Link,
  notFound,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTransition } from "react";
import { SiteFooter } from "@/components/site-footer";
import { getViewer } from "@/server/auth";
import {
  approveAdmin,
  dismissAdminApplication,
  getAdminOpsQueue,
  revokeAdmin,
  type AdminOps,
  type AdminOpsApplicant,
} from "@/server/admin";
import { AdminTabs } from "./admin";

export const Route = createFileRoute("/admin/league-ops")({
  beforeLoad: async () => {
    const viewer = await getViewer();
    if (!viewer) {
      throw redirect({
        to: "/signin",
        search: { redirect: "/admin/league-ops" },
      });
    }
    if (!viewer.isAdmin) throw notFound();
    return { viewer };
  },
  loader: async () => {
    const queue = await getAdminOpsQueue();
    if (!queue) throw notFound();
    return queue;
  },
  component: AdminOpsPage,
  head: () => ({
    meta: [
      { title: "Admin · League ops · The Hat League" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminOpsPage() {
  const { pending, confirmed } = Route.useLoaderData();

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="flex-1">
        <AdminTabs current="league-ops" />
        <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
          <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
            League ops
          </div>
          <h1 className="mt-3 text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl">
            {pending.length} pending,{" "}
            <span className="font-marker font-normal text-thl-orange">
              {confirmed.length} confirmed.
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-neutral-600 dark:text-neutral-400">
            Approving an applicant flips their <code>is_admin</code> flag on.
            They&apos;ll see <code>/admin</code> the next time they reload.
          </p>

          <h2 className="mt-12 text-xl font-bold tracking-tight">
            Pending applications
          </h2>
          {pending.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-8 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
              No pending applications.
            </p>
          ) : (
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {pending.map((p) => (
                <PendingCard key={p.id} row={p} />
              ))}
            </ul>
          )}

          <h2 className="mt-16 text-xl font-bold tracking-tight">
            Confirmed admins
          </h2>
          {confirmed.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-8 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
              No confirmed admins.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {confirmed.map((c) => (
                <ConfirmedCard key={c.id} row={c} />
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function PendingCard({ row }: { row: AdminOpsApplicant }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, start] = useTransition();
  const name = row.discord_global_name ?? row.discord_username ?? "Unnamed";

  function action(fn: typeof approveAdmin) {
    start(async () => {
      await fn({ data: { profileId: row.id } });
      router.invalidate();
      queryClient.invalidateQueries({ queryKey: ["viewer"] });
    });
  }

  return (
    <li className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center gap-3">
        {row.discord_avatar_url ? (
          <img
            src={row.discord_avatar_url}
            alt=""
            className="h-12 w-12 rounded-full border border-neutral-200 dark:border-neutral-800"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thl-orange font-bold text-black">
            {name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-base font-bold">
            {row.discord_username ? (
              <Link
                to="/players/$username"
                params={{ username: row.discord_username }}
                className="hover:text-thl-orange"
              >
                {name}
              </Link>
            ) : (
              name
            )}
          </div>
          <div className="truncate text-xs text-neutral-500">
            @{row.discord_username ?? "—"}
          </div>
        </div>
      </div>

      {row.admin_pitch && (
        <blockquote className="mt-4 max-h-48 overflow-auto border-l-2 border-thl-orange/40 pl-3 text-sm leading-relaxed text-neutral-700 italic dark:text-neutral-300">
          &ldquo;{row.admin_pitch}&rdquo;
        </blockquote>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <button
          type="button"
          onClick={() => action(approveAdmin)}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-thl-orange px-3 py-2 text-sm font-bold text-black transition hover:bg-thl-orange-deep disabled:opacity-60"
        >
          Approve as admin
        </button>
        <button
          type="button"
          onClick={() => action(dismissAdminApplication)}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:border-rose-400 hover:text-rose-500 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300"
        >
          Dismiss
        </button>
      </div>
    </li>
  );
}

function ConfirmedCard({ row }: { row: AdminOps }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const name = row.discord_global_name ?? row.discord_username ?? "Unnamed";

  function onRevoke() {
    start(async () => {
      await revokeAdmin({ data: { profileId: row.id } });
      router.invalidate();
    });
  }

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      {row.discord_avatar_url ? (
        <img
          src={row.discord_avatar_url}
          alt=""
          className="h-10 w-10 rounded-full border border-neutral-200 dark:border-neutral-800"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-thl-orange text-xs font-bold text-black">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{name}</div>
        <div className="text-xs text-neutral-500">
          @{row.discord_username ?? "—"}
        </div>
      </div>
      <button
        type="button"
        onClick={onRevoke}
        disabled={pending}
        className="rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-500 transition hover:border-rose-400 hover:text-rose-500 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-400"
      >
        Revoke
      </button>
    </li>
  );
}
