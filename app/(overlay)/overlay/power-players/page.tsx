import { resolveOverlay } from "@/lib/overlay/gate";
import { loadPointsLeaders } from "@/lib/data/stats";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { Stage, Panel, RankNum, OVL_ORANGE } from "@/components/overlay/chrome";

export const dynamic = "force-dynamic";

export default async function PowerPlayersOverlay(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await resolveOverlay(await props.searchParams);
  if (!ctx) return null;
  const leaders = await loadPointsLeaders(ctx.seasonId, 8);

  return (
    <Stage place="left">
      <RealtimeRefresh tables={["point_events"]} channel="overlay-power-players" />
      <Panel accent={OVL_ORANGE} kicker="Power Players" meta="League points" className="w-full max-w-md">
        <ol className="thl-ovl-stagger mt-6 space-y-2">
          {leaders.map((p, i) => (
            <li
              key={p.profileId}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                i === 0 ? "bg-thl-orange/15 ring-1 ring-thl-orange/40" : "bg-white/[0.04]"
              }`}
            >
              <RankNum n={i + 1} />
              <span className="min-w-0 flex-1 truncate text-xl font-bold">{p.name}</span>
              <span className="text-2xl font-black text-thl-orange tabular-nums">{p.points}</span>
            </li>
          ))}
          {leaders.length === 0 && <li className="px-3 py-2 text-white/60">No points yet.</li>}
        </ol>
      </Panel>
    </Stage>
  );
}
