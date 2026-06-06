import { PageShell } from "@/components/page/page-shell";
import { PageHero } from "@/components/page/page-hero";
import Image from "next/image";
import Link from "next/link";
import { RankBadge } from "@/components/ranks/rank-badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadCompare, type CompareCard } from "@/lib/data/compare";
import { ComparePicker, type PickerPlayer } from "@/components/players/compare-picker";

export const metadata = {
  title: "Compare players",
  description: "Side-by-side scouting — stack two players' ranks, stats, and points.",
};

export default async function ComparePage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const a = typeof sp.a === "string" ? sp.a : null;
  const b = typeof sp.b === "string" ? sp.b : null;

  const supabase = await createSupabaseServerClient();
  // Admins testing a mock draft can compare mock players too; the public picker
  // only ever lists real players.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    isAdmin = Boolean(me?.is_admin);
  }
  let poolQuery = supabase
    .from("profiles")
    .select("discord_username, discord_global_name")
    .eq("in_player_pool", true);
  if (!isAdmin) poolQuery = poolQuery.eq("is_mock", false);
  const [{ data: pool }, compare] = await Promise.all([poolQuery, loadCompare(a, b)]);

  const players: PickerPlayer[] = (pool ?? [])
    .filter((p) => p.discord_username)
    .map((p) => ({
      username: p.discord_username as string,
      name: p.discord_global_name ?? (p.discord_username as string),
    }))
    .sort((x, y) => x.name.localeCompare(y.name));

  return (
    <PageShell>
      <PageHero
        eyebrow="Scouting"
        title="Tale of"
        accent="the tape."
        subtitle={<>Stack two players head-to-head — ranks, season stats, league points and patches.</>}
      />

      <section className="mx-auto max-w-[1100px] px-6 pb-24 md:px-10">
        <ComparePicker players={players} a={a} b={b} />

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <CompareColumn card={compare.a} other={compare.b} />
          <CompareColumn card={compare.b} other={compare.a} />
        </div>
      </section>
    </PageShell>
  );
}

function CompareColumn({ card, other }: { card: CompareCard | null; other: CompareCard | null }) {
  if (!card) {
    return (
      <div className="flex min-h-[20rem] items-center justify-center rounded-3xl border border-dashed border-neutral-300 text-sm text-neutral-500 dark:border-neutral-800">
        Pick a player.
      </div>
    );
  }
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center gap-3">
        {card.avatarUrl ? (
          <Image src={card.avatarUrl} alt="" width={52} height={52} unoptimized className="h-12 w-12 rounded-full" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thl-orange font-bold text-black">
            {card.name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0">
          {card.username ? (
            <Link href={`/players/${encodeURIComponent(card.username)}`} className="text-2xl font-bold tracking-tight hover:text-thl-orange">
              {card.name}
            </Link>
          ) : (
            <div className="text-2xl font-bold tracking-tight">{card.name}</div>
          )}
        </div>
      </div>

      <dl className="mt-5 space-y-2">
        <RankRow label="Peak" value={card.peakRank} />
        <RankRow label="3v3" value={card.rank3v3} />
        <RankRow label="2v2" value={card.rank2v2} />
        <StatRow label="Games" value={card.gp} other={other?.gp} />
        <StatRow label="Goals" value={card.goals} other={other?.goals} />
        <StatRow label="Assists" value={card.assists} other={other?.assists} />
        <StatRow label="Saves" value={card.saves} other={other?.saves} />
        <StatRow label="Points" value={card.points} other={other?.points} highlight />
        <StatRow label="Patches" value={card.patches} other={other?.patches} />
      </dl>
    </div>
  );
}

function RankRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-900">
      <span className="text-xs font-bold tracking-[0.18em] text-neutral-500 uppercase">{label}</span>
      <RankBadge value={value} size={18} abbreviate textClassName="text-sm font-bold" />
    </div>
  );
}

function StatRow({
  label,
  value,
  other,
  highlight,
}: {
  label: string;
  value: number;
  other?: number;
  highlight?: boolean;
}) {
  const wins = other != null && value > other;
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-900">
      <span className="text-xs font-bold tracking-[0.18em] text-neutral-500 uppercase">{label}</span>
      <span
        className={`text-lg font-bold tabular-nums ${
          highlight || wins ? "text-thl-orange" : "text-neutral-900 dark:text-white"
        }`}
      >
        {value}
        {wins && <span className="ml-1 text-xs">▲</span>}
      </span>
    </div>
  );
}
