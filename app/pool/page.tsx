import Link from "next/link";
import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import { ArrowRight, DiscordIcon } from "@/components/icons/brand";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PoolBoard, type SortKey } from "@/components/pool/pool-board";
import { POOL_SELECT, type PoolRow } from "@/lib/data/pool";

export const metadata = {
  title: "Player pool",
  description:
    "Every player who's signed up for The Hat League Season 4 draft, ordered by rank.",
};

export default async function PoolPage(props: PageProps<"/pool">) {
  const sp = await props.searchParams;
  const sort: SortKey =
    sp.sort === "rank_3v3" ||
    sp.sort === "rank_2v2" ||
    sp.sort === "joined"
      ? sp.sort
      : "peak";

  const supabase = await createSupabaseServerClient();
  const { data: players } = await supabase
    .from("profiles")
    .select(POOL_SELECT)
    .eq("in_player_pool", true);
  const initialRows: PoolRow[] = (players ?? []) as PoolRow[];

  return (
    <PageShell>
      <PageHero
        eyebrow="Player pool · Season 04"
        title="Everyone in the lobby."
        accent="Pre-draft."
        subtitle={
          <>
            Every player who&apos;s signed up and confirmed their ranks. This
            list updates live — new sign-ups appear instantly. Sort it any way
            you want.
          </>
        }
        actions={
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 rounded-xl bg-thl-orange px-5 py-3.5 font-bold text-black transition hover:bg-thl-orange-deep"
          >
            <DiscordIcon className="h-5 w-5" />
            Add yourself
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <PoolBoard initialRows={initialRows} sort={sort} />
    </PageShell>
  );
}
