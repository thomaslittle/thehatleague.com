import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { AdminActionToast } from "@/components/admin/admin-action-toast";
import { parseAdminToastKind } from "@/lib/admin/toast-kinds";
import { AdminPlayersTable } from "@/components/admin/admin-players-table";

export const metadata = {
  title: "Players · Admin",
};

export default async function AdminPlayersPage(
  props: PageProps<"/admin/players">,
) {
  const sp = await props.searchParams;
  const actor = await requireAdmin("/admin/players");

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("profiles")
    .select(
      "id, discord_username, discord_global_name, discord_avatar_url, peak_rank, peak_rank_playlist, rank_2v2, rank_3v3, in_player_pool, is_captain, is_captain_applicant, is_admin, created_at",
    )
    .order("created_at", { ascending: false });

  const players = rows ?? [];
  const onboardedCount = players.filter(
    (p) => p.rank_2v2 && p.rank_3v3 && p.peak_rank,
  ).length;

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 md:px-10 md:py-16">
      <AdminActionToast kind={parseAdminToastKind(sp.toast)} />
      <div className="text-xs font-bold tracking-[0.28em] text-thl-orange uppercase">
        Players
      </div>
      <h1 className="mt-3 text-4xl leading-tight font-bold tracking-[-0.02em] md:text-5xl">
        {players.length} total ·{" "}
        <span className="font-marker font-normal text-thl-orange">
          {onboardedCount} ranked.
        </span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
        Every profile in the system. Flip pool membership or admin role here;
        captain status lives on{" "}
        <Link
          href="/admin/captains"
          className="font-semibold text-thl-orange underline-offset-4 hover:underline"
        >
          /admin/captains
        </Link>
        . Click any column header to sort.
      </p>

      <div className="mt-10">
        <AdminPlayersTable players={players} actorId={actor.id} />
      </div>
    </section>
  );
}
