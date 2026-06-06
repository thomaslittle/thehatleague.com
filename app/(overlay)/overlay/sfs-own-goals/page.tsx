import Image from "next/image";
import { getSfsOwnGoalStats } from "@/lib/data/sfs";
import { RealtimeRefresh } from "@/components/realtime/realtime-refresh";
import { Stage, Panel } from "@/components/overlay/chrome";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

const AMBER = "#fbbf24";

/**
 * Public OBS browser-source overlay for the SH*T Faced Saturday own-goal
 * counter. No token gate (the count isn't sensitive); updates live via the
 * sfs_own_goals realtime channel. Drop it into OBS at 1920×1080.
 */
export default async function SfsOwnGoalsOverlay() {
  const stats = await getSfsOwnGoalStats();
  const [top, ...rest] = stats.leaders;

  return (
    <Stage place="left">
      <RealtimeRefresh
        tables={["sfs_own_goals"]}
        channel="overlay-sfs-own-goals"
      />
      <Panel
        accent={AMBER}
        kicker="Own goals"
        meta="SH*T Faced Saturday"
        className="w-full max-w-md"
      >
        <div className="mt-7 flex items-end gap-4">
          <span
            className="font-marker text-[7rem] leading-[0.8]"
            style={{ color: AMBER }}
          >
            {stats.total}
          </span>
          <span className="pb-3 text-sm font-bold tracking-[0.22em] text-white/45 uppercase">
            and
            <br />
            counting
          </span>
        </div>

        {top && (
          <div className="mt-7 flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
            {top.avatarUrl ? (
              <Image
                src={top.avatarUrl}
                alt=""
                width={48}
                height={48}
                className="size-12 shrink-0 rounded-full object-cover ring-2 ring-amber-400/70"
                aria-hidden
              />
            ) : (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-base font-bold">
                {top.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold tracking-[0.22em] text-white/45 uppercase">
                Worst offender
              </div>
              <div className="truncate text-xl font-extrabold">{top.name}</div>
            </div>
            <span
              className="rounded-xl px-3 py-1.5 text-lg font-black tabular-nums"
              style={{ background: AMBER, color: "#0a0a0a" }}
            >
              {top.count}
            </span>
          </div>
        )}

        {rest.length > 0 && (
          <ol className="thl-ovl-stagger mt-3 space-y-1.5">
            {rest.slice(0, 4).map((l, i) => (
              <li
                key={l.key}
                className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2 ring-1 ring-white/5"
              >
                <span className="w-5 text-center text-sm font-black tabular-nums text-white/40">
                  {i + 2}
                </span>
                <span className="min-w-0 flex-1 truncate font-bold">
                  {l.name}
                </span>
                <span className="text-base font-black tabular-nums text-amber-300">
                  {l.count}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </Stage>
  );
}
