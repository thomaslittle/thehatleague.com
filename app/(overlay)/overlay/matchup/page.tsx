import { resolveOverlay } from "@/lib/overlay/gate";
import { loadMatch } from "@/lib/data/tournament";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { Stage, Panel, OVL_ORANGE } from "@/components/overlay/chrome";

export const dynamic = "force-dynamic";

export default async function MatchupOverlay(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await resolveOverlay(await props.searchParams);
  if (!ctx) return null;
  const sp = await props.searchParams;
  const id = Array.isArray(sp.id) ? sp.id[0] : sp.id;
  const data = id ? await loadMatch(id) : null;
  if (!data) return null;
  const { match } = data;
  const isFinal = match.status === "final";
  const homeWon = match.winnerTeamId === match.home?.id;

  return (
    <Stage place="center">
      <RealtimeRefresh tables={["matches"]} channel={`overlay-matchup-${id}`} />
      <Panel
        accent={OVL_ORANGE}
        kicker={match.conference ?? "League"}
        meta={`${match.week ? `Week ${match.week} · ` : ""}${isFinal ? "Final" : "Live"}`}
        className="w-full max-w-3xl"
      >
        <div className="mt-9 grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          <TeamSide
            name={match.home?.name ?? "TBD"}
            color={match.home?.color ?? null}
            won={isFinal && homeWon}
          />
          <div className="flex flex-col items-center gap-2">
            {isFinal ? (
              <div className="flex items-center gap-3 text-7xl font-black tabular-nums">
                <span className={homeWon ? "text-thl-orange" : "text-white/45"}>{match.homeScore}</span>
                <span className="text-3xl text-white/25">–</span>
                <span className={!homeWon ? "text-thl-orange" : "text-white/45"}>{match.awayScore}</span>
              </div>
            ) : (
              <span className="rounded-xl bg-thl-orange px-4 py-1.5 text-2xl font-black tracking-widest text-black">
                VS
              </span>
            )}
            <span className="text-[11px] font-extrabold tracking-[0.3em] text-white/35 uppercase">
              {isFinal ? "Final score" : "Tip-off soon"}
            </span>
          </div>
          <TeamSide
            name={match.away?.name ?? "TBD"}
            color={match.away?.color ?? null}
            won={isFinal && !homeWon}
          />
        </div>
      </Panel>
    </Stage>
  );
}

function TeamSide({ name, color, won }: { name: string; color: string | null; won: boolean }) {
  const accent = color ?? OVL_ORANGE;
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span
        className="flex h-24 w-24 items-center justify-center rounded-2xl text-5xl font-black text-white"
        style={{
          background: accent,
          boxShadow: won
            ? `0 0 0 3px rgba(255,255,255,0.9), 0 18px 50px -12px ${accent}`
            : `0 14px 40px -14px ${accent}`,
        }}
      >
        {name.slice(0, 1)}
      </span>
      <span className={`text-2xl leading-tight font-black tracking-tight ${won ? "text-thl-orange" : "text-white"}`}>
        {name}
      </span>
      {won && (
        <span className="rounded-full bg-thl-orange/15 px-2.5 py-0.5 text-[10px] font-extrabold tracking-[0.2em] text-thl-orange uppercase ring-1 ring-thl-orange/40">
          Winner
        </span>
      )}
    </div>
  );
}
