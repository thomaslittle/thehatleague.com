import {
  createFileRoute,
  Link,
  notFound,
  redirect,
} from "@tanstack/react-router";
import { ArrowRight } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { getViewer } from "@/server/auth";
import { getAdminStats } from "@/server/admin";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const viewer = await getViewer();
    if (!viewer) {
      throw redirect({ to: "/signin", search: { redirect: "/admin" } });
    }
    if (!viewer.isAdmin) throw notFound();
    return { viewer };
  },
  loader: async () => {
    const stats = await getAdminStats();
    if (!stats) throw notFound();
    return { stats };
  },
  component: AdminIndexPage,
  head: () => ({
    meta: [
      { title: "League ops · The Hat League" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminIndexPage() {
  const { stats } = Route.useLoaderData();
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 antialiased dark:bg-black dark:text-white">
      <main id="main" className="flex-1">
        <AdminTabs current="overview" />
        <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
          <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
            Admin · Season 04
          </div>
          <h1
            className="mt-3 font-marker text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl"
            style={{ textShadow: "-2px 2px 0px #f76103" }}
          >
            Run the league.
          </h1>
          <p className="mt-3 max-w-xl text-neutral-600 dark:text-neutral-400">
            League operations
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Pending captain apps" value={stats.pendingCaptains} />
            <Stat label="Confirmed captains" value={stats.confirmedCaptains} />
            <Stat label="Pending ops apps" value={stats.pendingOps} />
            <Stat label="Players in pool" value={stats.totalPool} />
            <Stat label="Announcements" value={stats.announcementCount} />
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <AdminLink
              to="/admin/captains"
              eyebrow="Captains"
              title="Approve applications"
              desc="Review the pitches, promote to captain in one click."
            />
            <AdminLink
              to="/admin/league-ops"
              eyebrow="League ops"
              title="Approve ops requests"
              desc="Users asking to join league ops. Approving promotes them to admin."
            />
            <AdminLink
              to="/admin/announcements"
              eyebrow="Announcements"
              title="Post an update"
              desc="Write directly here — pinning shows it in the header strip."
            />
            <AdminLink
              to="/admin/players"
              eyebrow="Players"
              title="Manage profiles"
              desc="Flip pool membership and admin role. Captain status lives in the Captains tab."
            />
            <AdminLink
              to="/admin/og-preview"
              eyebrow="OG preview"
              title="See how links unfurl"
              desc="Live render of every social card the site emits, with a Discord-style mock for each."
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export function AdminTabs({
  current,
}: {
  current:
    | "overview"
    | "captains"
    | "league-ops"
    | "announcements"
    | "players"
    | "og-preview";
}) {
  return (
    <div className="border-b border-neutral-200/70 bg-neutral-50/70 backdrop-blur-sm dark:border-neutral-900/70 dark:bg-neutral-950/60">
      <div className="mx-auto max-w-[1320px] px-6 py-4 md:px-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          <span className="hidden text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase md:inline">
            League ops
          </span>
          <nav aria-label="Admin sections" className="flex flex-wrap gap-1">
            <AdminTab to="/admin" active={current === "overview"}>
              Overview
            </AdminTab>
            <AdminTab to="/admin/captains" active={current === "captains"}>
              Captains
            </AdminTab>
            <AdminTab
              to="/admin/league-ops"
              active={current === "league-ops"}
            >
              League ops queue
            </AdminTab>
            <AdminTab
              to="/admin/announcements"
              active={current === "announcements"}
            >
              Announcements
            </AdminTab>
            <AdminTab to="/admin/players" active={current === "players"}>
              Players
            </AdminTab>
            <AdminTab
              to="/admin/og-preview"
              active={current === "og-preview"}
            >
              OG preview
            </AdminTab>
          </nav>
        </div>
      </div>
    </div>
  );
}

function AdminTab({
  to,
  children,
  active,
}: {
  to:
    | "/admin"
    | "/admin/captains"
    | "/admin/league-ops"
    | "/admin/announcements"
    | "/admin/players"
    | "/admin/og-preview";
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={
        "rounded-md px-3 py-1.5 text-sm font-semibold transition " +
        (active
          ? "bg-thl-orange text-black"
          : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white")
      }
    >
      {children}
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        {label}
      </div>
      <div className="mt-2 font-marker text-3xl tabular-nums">{value}</div>
    </div>
  );
}

function AdminLink({
  to,
  eyebrow,
  title,
  desc,
}: {
  to:
    | "/admin/captains"
    | "/admin/league-ops"
    | "/admin/announcements"
    | "/admin/players"
    | "/admin/og-preview";
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950"
    >
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        {eyebrow}
      </div>
      <div className="mt-2 text-lg font-bold">{title}</div>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        {desc}
      </p>
      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-thl-orange opacity-0 transition group-hover:opacity-100">
        Open <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
