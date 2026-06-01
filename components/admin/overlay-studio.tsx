"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlignLeft,
  Check,
  Copy,
  Crown,
  ExternalLink,
  LayoutGrid,
  ListOrdered,
  MonitorPlay,
  RectangleHorizontal,
  Star,
  Swords,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OverlayPreview } from "@/components/admin/overlay-preview";
import { useOverlayLive } from "@/lib/draft/use-overlay-live";
import type { OverlaySettingsView } from "@/lib/data/overlay";
import { ensureOverlaySettings, updateOverlaySettings } from "@/app/actions/overlay";

type Result = { ok?: boolean; error?: string; skipped?: boolean };

interface SourceDef {
  path: string;
  label: string;
  note: string;
  place: string;
  icon: LucideIcon;
}

// The "On the Clock" source is the one every stream keeps up — it shows who's
// picking + the timer AND auto-plays the pick reveal.
const FEATURED: SourceDef = {
  path: "/overlay/draft/on-clock",
  label: "On the Clock",
  note: "Who's picking + the live timer — and it auto-plays the “pick is in” reveal. The one source you keep up all draft.",
  place: "Top card",
  icon: Timer,
};

// Draft-night overlays — the tools you actually use while picking. Each is its
// own independent, always-on browser source positioned / toggled in OBS.
const DRAFT_SOURCES: SourceDef[] = [
  { path: "/overlay/draft/ticker", label: "Ticker", note: "Scrolling recent picks + your ticker text.", place: "Bottom bar", icon: AlignLeft },
  { path: "/overlay/draft/best-available", label: "Best Available", note: "Top undrafted players by peak rank.", place: "Side panel", icon: TrendingUp },
  { path: "/overlay/draft/spotlight", label: "Top Prospect", note: "The #1 player on the board with full ranks.", place: "Side panel", icon: Star },
  { path: "/overlay/draft/up-next", label: "Up Next", note: "The upcoming pick order, several deep.", place: "Side panel", icon: ListOrdered },
  { path: "/overlay/draft/roster", label: "Team Roster", note: "The on-clock team's squad as it fills out.", place: "Side panel", icon: Users },
  { path: "/overlay/draft/board", label: "Draft Board", note: "The full draft grid — cut to it on demand.", place: "Full screen", icon: LayoutGrid },
  { path: "/overlay/lower-third", label: "Lower Third", note: "A banner for the text you push below.", place: "Lower third", icon: RectangleHorizontal },
];

// Season overlays — for match broadcasts after the draft. They stay empty
// until games are played, so they're separated out here.
const SEASON_SOURCES: SourceDef[] = [
  { path: "/overlay/standings", label: "Standings", note: "Conference tables — fills in once results land.", place: "Side panel", icon: Trophy },
  { path: "/overlay/power-players", label: "Power Players", note: "League-points leaders, for game-day streams.", place: "Side panel", icon: Crown },
  { path: "/overlay/matchup", label: "Matchup", note: "VS card for a match — append &id=<matchId>.", place: "Full screen", icon: Swords },
];

export function OverlayStudio({
  seasonId,
  seasonSlug,
  origin,
  initialOverlay,
  pending,
  run,
}: {
  seasonId: string;
  seasonSlug: string;
  origin: string;
  initialOverlay: OverlaySettingsView | null;
  pending: boolean;
  run: (label: string, fn: () => Promise<Result>) => void;
}) {
  const settings = useOverlayLive(
    seasonId,
    initialOverlay ?? {
      activeScene: "on_clock",
      theme: "dark",
      showTimer: true,
      showRecentPicks: true,
      showOnDeck: true,
      revealSeconds: 7,
      revealSound: true,
      lowerThird: null,
      tickerText: null,
      accent: null,
      token: "",
    },
  );
  const token = settings.token || initialOverlay?.token || "";
  const [lowerThird, setLowerThird] = useState(settings.lowerThird ?? "");
  const [ticker, setTicker] = useState(settings.tickerText ?? "");

  // Pin the season slug so OBS (anonymous) resolves to THIS season.
  const overlayUrl = (path: string) =>
    `${origin}${path}?token=${token}&season=${encodeURIComponent(seasonSlug)}`;
  const copy = (path: string) =>
    void navigator.clipboard?.writeText(overlayUrl(path)).then(
      () => toast.success("Browser-source URL copied"),
      () => toast.error("Copy failed"),
    );

  return (
    <div className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      {/* ── Studio header band (always dark — a broadcast console) ── */}
      <div className="relative overflow-hidden bg-neutral-950 px-6 py-5 text-white md:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(247,97,3,0.18)_1px,transparent_0)] [background-size:22px_22px]"
        />
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-10 h-52 w-52 rounded-full bg-thl-orange/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-thl-orange/15 ring-1 ring-thl-orange/40">
            <MonitorPlay className="h-5 w-5 text-thl-orange" aria-hidden />
          </span>
          <div>
            <div className="text-[10px] font-bold tracking-[0.28em] text-thl-orange uppercase">
              The Hat League · Broadcast
            </div>
            <h3 className="font-marker text-2xl leading-none">Overlay Studio</h3>
          </div>
        </div>
      </div>

      {!token ? (
        <EnablePanel pending={pending} onEnable={() => run("Overlays enabled", () => ensureOverlaySettings(seasonId))} />
      ) : (
        <div className="p-6 md:p-8">
          {/* How it works */}
          <ol className="mb-6 grid gap-2 text-sm text-neutral-600 sm:grid-cols-3 dark:text-neutral-400">
            <Step n={1} title="Add what you want" body="Each overlay is its own OBS browser source at 1920×1080 (transparent)." />
            <Step n={2} title="Position in OBS" body="Drag, layer, and show/hide them like any source — they're all always live." />
            <Step n={3} title="Push text live" body="The ticker & lower-third update instantly from the controls below." />
          </ol>

          {/* On-air controls */}
          <div className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Live controls
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Switch
                label="On-clock timer"
                on={settings.showTimer}
                disabled={pending}
                onClick={() =>
                  run("Toggled timer", () =>
                    updateOverlaySettings(seasonId, { show_timer: !settings.showTimer }),
                  )
                }
              />
              <Switch
                label="Show up next"
                on={settings.showOnDeck}
                disabled={pending}
                onClick={() =>
                  run("Toggled up next", () =>
                    updateOverlaySettings(seasonId, { show_on_deck: !settings.showOnDeck }),
                  )
                }
              />
              <Switch
                label="Ticker: recent picks"
                on={settings.showRecentPicks}
                disabled={pending}
                onClick={() =>
                  run("Toggled recent picks", () =>
                    updateOverlaySettings(seasonId, { show_recent_picks: !settings.showRecentPicks }),
                  )
                }
              />
              <Switch
                label="Reveal sound"
                on={settings.revealSound}
                disabled={pending}
                onClick={() =>
                  run("Toggled reveal sound", () =>
                    updateOverlaySettings(seasonId, { reveal_sound: !settings.revealSound }),
                  )
                }
              />
              <Stepper
                label="Reveal hold"
                value={settings.revealSeconds}
                suffix="s"
                min={3}
                max={30}
                disabled={pending}
                onChange={(v) =>
                  run("Reveal hold updated", () =>
                    updateOverlaySettings(seasonId, { reveal_seconds: v }),
                  )
                }
              />
            </div>
            <div className="mt-1 grid gap-4 sm:grid-cols-2">
              <PushField
                label="Lower third"
                placeholder="e.g. Round 2 · Sombrero Conference"
                value={lowerThird}
                onChange={setLowerThird}
                disabled={pending}
                onPush={() =>
                  run("Lower third pushed", () =>
                    updateOverlaySettings(seasonId, { lower_third: lowerThird || null }),
                  )
                }
              />
              <PushField
                label="Ticker text"
                placeholder="e.g. Trades open after Round 1"
                value={ticker}
                onChange={setTicker}
                disabled={pending}
                onPush={() =>
                  run("Ticker pushed", () =>
                    updateOverlaySettings(seasonId, { ticker_text: ticker || null }),
                  )
                }
              />
            </div>
          </div>

          {/* Draft overlays */}
          <div className="mt-8">
            <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
              Draft overlays
            </div>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              The tools you use while picking. Add as many as you like — each is an independent, always-on source.
            </p>

            {/* Featured: On the Clock */}
            <FeaturedSource source={FEATURED} previewSrc={overlayUrl(FEATURED.path)} url={overlayUrl(FEATURED.path)} onCopy={() => copy(FEATURED.path)} />

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DRAFT_SOURCES.map((s) => (
                <SourceCard
                  key={s.path}
                  source={s}
                  previewSrc={overlayUrl(s.path)}
                  url={overlayUrl(s.path)}
                  onCopy={() => copy(s.path)}
                />
              ))}
            </div>
          </div>

          {/* Season overlays — game day */}
          <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-500 uppercase">
              Season overlays · game day
            </div>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              For match broadcasts after the draft — these stay empty until the season&apos;s underway.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SEASON_SOURCES.map((s) => (
                <SourceCard
                  key={s.path}
                  source={s}
                  previewSrc={overlayUrl(s.path)}
                  url={overlayUrl(s.path)}
                  onCopy={() => copy(s.path)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Featured source (large) ─────────────────────────────────────────────────

function FeaturedSource({
  source,
  previewSrc,
  url,
  onCopy,
}: {
  source: SourceDef;
  previewSrc: string;
  url: string;
  onCopy: () => void;
}) {
  const Icon = source.icon;
  return (
    <div className="mt-4 grid gap-5 overflow-hidden rounded-2xl border border-thl-orange/30 bg-thl-orange/[0.04] p-4 md:grid-cols-[1.4fr_1fr] md:p-5">
      <div className="relative rounded-xl bg-neutral-950 p-2 ring-1 ring-neutral-800">
        <OverlayPreview src={previewSrc} eager className="rounded-lg" />
        <span className="absolute top-3 left-3 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold tracking-[0.16em] text-white uppercase backdrop-blur">
          {source.place}
        </span>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-thl-orange" aria-hidden />
          <span className="font-bold">{source.label}</span>
          <span className="ml-auto rounded-full bg-thl-orange/15 px-2 py-0.5 text-[9px] font-bold tracking-[0.14em] text-thl-orange uppercase">
            Auto-reveal
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-snug text-neutral-600 dark:text-neutral-400">{source.note}</p>
        <div className="mt-auto flex gap-2 pt-4">
          <Button size="sm" onClick={onCopy} className="flex-1">
            <Copy className="h-3.5 w-3.5" aria-hidden /> Copy source URL
          </Button>
          <a
            href={url}
            target="_blank"
            rel="noopener"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-300 px-3 text-sm font-semibold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Open
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Source card (with live preview) ─────────────────────────────────────────

function SourceCard({
  source,
  previewSrc,
  url,
  onCopy,
}: {
  source: SourceDef;
  previewSrc: string;
  url: string;
  onCopy: () => void;
}) {
  const Icon = source.icon;
  return (
    <div className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:border-thl-orange dark:border-neutral-800 dark:bg-neutral-950">
      <div className="relative border-b border-neutral-200 dark:border-neutral-800">
        <OverlayPreview src={previewSrc} />
        <span className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.14em] text-white uppercase backdrop-blur">
          {source.place}
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-thl-orange" aria-hidden />
          <span className="truncate text-sm font-bold">{source.label}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-neutral-500">{source.note}</p>
        <div className="mt-2.5 flex items-center gap-2">
          <Button size="xs" variant="outline" onClick={onCopy} className="flex-1">
            <Copy className="h-3 w-3" aria-hidden /> Copy
          </Button>
          <a
            href={url}
            target="_blank"
            rel="noopener"
            aria-label={`Open ${source.label} preview`}
            className="inline-flex h-6 items-center justify-center rounded-md border border-neutral-300 px-2 text-neutral-500 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700"
          >
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Small pieces ────────────────────────────────────────────────────────────

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-thl-orange/15 text-xs font-extrabold text-thl-orange">
        {n}
      </span>
      <span>
        <span className="block text-sm font-bold text-neutral-900 dark:text-white">{title}</span>
        <span className="block text-xs leading-snug text-neutral-500">{body}</span>
      </span>
    </li>
  );
}

function Switch({
  label,
  on,
  onClick,
  disabled,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 py-1.5 pr-3.5 pl-1.5 text-sm font-semibold transition hover:border-thl-orange disabled:opacity-60 dark:border-neutral-800"
    >
      <span className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-thl-orange" : "bg-neutral-300 dark:bg-neutral-700"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
      </span>
      {label}
    </button>
  );
}

function Stepper({
  label,
  value,
  suffix = "",
  min,
  max,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  suffix?: string;
  min: number;
  max: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const btn =
    "flex h-6 w-6 items-center justify-center rounded-full text-base font-bold leading-none transition hover:bg-thl-orange hover:text-black disabled:opacity-40 dark:bg-neutral-800";
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 py-1 pr-1 pl-3 text-sm font-semibold dark:border-neutral-800">
      <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={`bg-neutral-100 ${btn}`}
      >
        −
      </button>
      <span className="w-9 text-center tabular-nums">
        {value}
        {suffix}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={`bg-neutral-100 ${btn}`}
      >
        +
      </button>
    </div>
  );
}

function PushField({
  label,
  placeholder,
  value,
  onChange,
  onPush,
  disabled,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onPush: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-4">
      <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">{label}</label>
      <div className="mt-1.5 flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-9"
        />
        <Button size="sm" variant="secondary" disabled={disabled} onClick={onPush} className="shrink-0">
          Push to air
        </Button>
      </div>
    </div>
  );
}

// ── Enable (no token yet) ────────────────────────────────────────────────────

function EnablePanel({ pending, onEnable }: { pending: boolean; onEnable: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-12 text-center md:py-16">
      <Image src="/brand/thl-logo-notext.png" alt="" width={56} height={56} className="h-14 w-14 rounded-full opacity-90" />
      <div>
        <h4 className="text-lg font-bold tracking-tight">Light up the broadcast</h4>
        <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">
          Generate a secure overlay token and browser-source URLs for OBS. You only do this once per season.
        </p>
      </div>
      <Button size="lg" disabled={pending} onClick={onEnable}>
        <Check className="h-4 w-4" aria-hidden /> Enable overlays
      </Button>
    </div>
  );
}
