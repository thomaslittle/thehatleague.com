import { rankWeight } from "@/lib/data/rank-sort";
import { RankBadge } from "@/components/ranks/rank-badge";
import type { RankHistoryPoint } from "@/lib/data/awards";

/**
 * Minimal peak-rank sparkline. Pure SVG (no client JS) — maps each point's peak
 * rank to a numeric weight and draws the trend. Renders nothing with < 2 points.
 */
export function RankHistoryChart({ points }: { points: RankHistoryPoint[] }) {
  const usable = points.filter((p) => p.peakRank);
  if (usable.length < 2) return null;

  const weights = usable.map((p) => rankWeight(p.peakRank));
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const span = max - min || 1;

  const W = 280;
  const H = 60;
  const stepX = W / (usable.length - 1);
  const coords = weights.map((w, i) => {
    const x = i * stepX;
    const y = H - ((w - min) / span) * (H - 8) - 4;
    return [x, y] as const;
  });
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const latest = usable[usable.length - 1];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
          Rank trend
        </div>
        <RankBadge value={latest.peakRank} size={16} abbreviate textClassName="text-xs font-bold" />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-16 w-full" preserveAspectRatio="none" aria-hidden>
        <path d={path} fill="none" stroke="var(--color-thl-orange)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {coords.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3} fill="var(--color-thl-orange)" />
        ))}
      </svg>
    </div>
  );
}
