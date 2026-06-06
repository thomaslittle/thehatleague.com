import { resolveOverlay } from "@/lib/overlay/gate";
import { loadStandings } from "@/lib/data/tournament";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { Stage, Panel, RankNum, TeamDot, OVL_ORANGE } from "@/components/overlay/chrome";

export const dynamic = "force-dynamic";

const COLS = "grid-cols-[2.75rem_1fr_2.75rem_2.75rem_3.5rem]";

export default async function StandingsOverlay(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await resolveOverlay(await props.searchParams);
  if (!ctx) return null;
  const rows = await loadStandings(ctx.seasonId);

  return (
    <Stage place="left">
      <RealtimeRefresh tables={["matches"]} channel="overlay-standings" />
      <Panel accent={OVL_ORANGE} kicker="Standings" meta="Live" className="w-full max-w-xl">
        <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-white/10">
          <div className={`grid ${COLS} items-center bg-white/[0.06] px-4 py-2.5 text-[11px] font-bold tracking-[0.18em] text-white/45 uppercase`}>
            <span>#</span>
            <span>Team</span>
            <span className="text-center">W</span>
            <span className="text-center">L</span>
            <span className="text-center">Diff</span>
          </div>
          <ol className="thl-ovl-stagger">
            {rows.map((r, i) => (
              <li
                key={r.teamId}
                className={`grid ${COLS} items-center border-t border-white/10 px-4 py-2.5 ${
                  i === 0 ? "bg-thl-orange/10" : ""
                }`}
              >
                <RankNum n={i + 1} />
                <span className="flex min-w-0 items-center gap-2.5">
                  <TeamDot color={r.color} />
                  <span className="truncate text-lg font-bold">{r.name}</span>
                </span>
                <span className="text-center font-bold tabular-nums">{r.w}</span>
                <span className="text-center tabular-nums text-white/55">{r.l}</span>
                <span
                  className={`text-center font-bold tabular-nums ${
                    r.diff > 0 ? "text-emerald-400" : r.diff < 0 ? "text-rose-400" : "text-white/60"
                  }`}
                >
                  {r.diff >= 0 ? "+" : ""}
                  {r.diff}
                </span>
              </li>
            ))}
            {rows.length === 0 && (
              <li className="px-4 py-8 text-center text-white/50">No results yet.</li>
            )}
          </ol>
        </div>
      </Panel>
    </Stage>
  );
}
