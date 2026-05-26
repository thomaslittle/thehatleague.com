import Link from "next/link";
import { ArrowRight } from "@/components/icons/brand";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminIndexPage() {
  const supabase = await createSupabaseServerClient();
  const [
    { count: pendingCaptains },
    { count: confirmedCaptains },
    { count: pendingOps },
    { count: totalPool },
    { count: announcementCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_captain_applicant", true)
      .eq("is_captain", false),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_captain", true),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_admin_applicant", true)
      .eq("is_admin", false),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("in_player_pool", true),
    supabase.from("announcements").select("id", { count: "exact", head: true }),
  ]);

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
      <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
        Admin · Season 04
      </div>
      <h1 className="mt-3 text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl font-marker" style={{textShadow: '-2px 2px 0px #f76103'}}>
        Run the league.
      </h1>
      <p className="mt-3 max-w-xl text-neutral-600 dark:text-neutral-400">
        League operations
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Pending captain apps" value={pendingCaptains ?? 0} />
        <Stat label="Confirmed captains" value={confirmedCaptains ?? 0} />
        <Stat label="Pending ops apps" value={pendingOps ?? 0} />
        <Stat label="Players in pool" value={totalPool ?? 0} />
        <Stat label="Announcements" value={announcementCount ?? 0} />
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <AdminLink
          href="/admin/captains"
          eyebrow="Captains"
          title="Approve applications"
          desc="Review the pitches, promote to captain in one click."
        />
        <AdminLink
          href="/admin/league-ops"
          eyebrow="League ops"
          title="Approve ops requests"
          desc="Users asking to join league ops. Approving promotes them to admin."
        />
        <AdminLink
          href="/admin/announcements"
          eyebrow="Announcements"
          title="Post an update"
          desc="Write directly here — pinning shows it in the header strip."
        />
        <AdminLink
          href="/admin/players"
          eyebrow="Players"
          title="Manage profiles"
          desc="Flip pool membership and admin role. Captain status lives in the Captains tab."
        />
        <AdminLink
          href="/admin/og-preview"
          eyebrow="OG preview"
          title="See how links unfurl"
          desc="Live render of every social card the site emits, with a Discord-style mock for each."
        />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        {label}
      </div>
      <div className="mt-2 font-marker text-4xl">{value}</div>
    </div>
  );
}

function AdminLink({
  href,
  eyebrow,
  title,
  desc,
}: {
  href: string;
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-thl-orange hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-thl-orange"
    >
      <span className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        {eyebrow}
      </span>
      <span className="text-2xl font-bold tracking-tight">{title}</span>
      <span className="text-sm text-neutral-500 dark:text-neutral-400">
        {desc}
      </span>
      <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-thl-orange opacity-0 transition group-hover:opacity-100">
        Open <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
