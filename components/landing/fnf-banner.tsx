import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Swords } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LocalTime } from "@/components/fnf/local-time";

/**
 * Landing-page promo for Friday Nite Fights — the first thing players see
 * under the hero. Pulls the live tournament + entrant count so the CTA reads
 * "join the X already in". Hidden only if no tournament exists at all.
 */
export async function FnfBanner() {
  const supabase = await createSupabaseServerClient();
  const { data: tournament } = await supabase
    .from("fnf_tournaments")
    .select("id, status, swiss_rounds, playoff_cut, starts_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!tournament) return null;

  const { count } = await supabase
    .from("fnf_registrations")
    .select("profile_id", { count: "exact", head: true })
    .eq("tournament_id", tournament.id);

  const live = tournament.status === "swiss" || tournament.status === "playoffs";
  const open = tournament.status === "registration";
  const label = live
    ? "Live now"
    : open
      ? "Registration open"
      : tournament.status === "teams"
        ? "Teams locked"
        : "Results";
  const cta = open ? "Enter tonight" : live ? "Watch it live" : "View bracket";

  const showStart = open && tournament.starts_at;

  return (
    <section className="px-6 py-8 md:px-10 md:py-12">
      <Link
        href="/friday-nite-fights"
        className="group relative mx-auto flex max-w-[1320px] flex-col items-center gap-8 overflow-hidden rounded-3xl border border-thl-orange/30 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black p-7 shadow-2xl shadow-black/40 md:flex-row md:p-10"
      >
        {/* glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-thl-orange/30 blur-3xl transition-opacity duration-500 group-hover:opacity-90 md:size-96"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -bottom-24 size-72 rounded-full bg-amber-500/20 blur-3xl"
        />

        {/* logo */}
        <div className="relative aspect-square w-36 shrink-0 md:w-52">
          <Image
            src="/brand/fnf.png"
            alt="Friday Nite Fights"
            fill
            sizes="208px"
            className="object-contain drop-shadow-[0_8px_40px_rgba(255,107,0,0.45)] transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* copy */}
        <div className="relative flex-1 text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-thl-orange/40 bg-thl-orange/10 px-3 py-1 text-[11px] font-bold tracking-widest text-thl-orange uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-thl-orange" />
            {label} · Every Friday · 2v2
          </span>
          <h2 className="mt-4 text-4xl leading-[0.95] font-bold tracking-tight text-white md:text-6xl">
            Friday Nite{" "}
            <span className="font-marker font-normal text-thl-orange">
              Fights
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-300 md:mx-0 md:text-base">
            Connect Discord and we auto-build rank-balanced 2v2 teams. Battle
            through {tournament.swiss_rounds} Swiss rounds — top{" "}
            {tournament.playoff_cut} make the playoffs.
            {showStart ? (
              <>
                {" "}
                Starts <LocalTime iso={tournament.starts_at!} />.
              </>
            ) : (
              ""
            )}
          </p>
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row md:items-center md:justify-start">
            <span className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-thl-orange to-amber-500 px-7 text-base font-bold text-white shadow-lg shadow-thl-orange/30 transition-all group-hover:-translate-y-0.5 group-hover:shadow-xl group-hover:shadow-thl-orange/40">
              <Swords className="size-5" />
              {cta}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </span>
            {typeof count === "number" && count > 0 && (
              <span className="text-sm font-semibold text-neutral-400">
                {count} {count === 1 ? "player" : "players"} entered
              </span>
            )}
          </div>
        </div>
      </Link>
    </section>
  );
}
