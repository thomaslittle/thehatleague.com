"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { DraftGuideButton } from "@/components/admin/draft-guide-dialog";
import {
  seedMockLeague,
  runMockDraft,
  simulateSeasonResults,
  buildFullMockLeague,
  resetMockLeague,
} from "@/app/actions/mock-draft";

type Result = { ok?: boolean; error?: string; note?: string };

export function MockLab({ exists, summary }: { exists: boolean; summary: string | null }) {
  const [pending, startTransition] = useTransition();
  const [players, setPlayers] = useState(30);
  const [captains, setCaptains] = useState(6);
  const [rosterSize, setRosterSize] = useState(3);
  const [pickSeconds, setPickSeconds] = useState(30);

  const run = (label: string, fn: () => Promise<Result>) => {
    startTransition(async () => {
      const res = await fn();
      if (res?.error) toast.error(res.error);
      else toast.success(res?.note ? `${label}: ${res.note}` : `${label}`);
    });
  };

  const opts = { players, captains, rosterSize, pickSeconds };

  return (
    <>
      <section className="relative">
        <div className="mx-auto max-w-[1320px] px-6 pt-12 pb-10 md:px-10 md:pt-20 md:pb-16">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold tracking-[0.24em] text-thl-orange uppercase md:text-xs md:tracking-[0.28em]">
                Mock draft lab
              </div>
              <h1 className="mt-3 max-w-3xl text-[2.25rem] leading-[1] font-bold tracking-[-0.03em] sm:text-5xl md:mt-4 md:text-6xl md:leading-[0.95] md:tracking-[-0.035em] lg:text-7xl">
                Demo <span className="font-marker font-normal text-thl-orange">league.</span>
              </h1>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <DraftGuideButton label="Guide" />
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.2em] uppercase ${
                  exists ? "bg-emerald-500 text-black" : "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
              >
                {pending && <span className="h-2 w-2 animate-pulse motion-reduce:animate-none rounded-full bg-current" />}
                {exists ? "Mock live" : "No mock"}
              </span>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-600 md:mt-6 md:text-lg dark:text-neutral-400">
            Stand up a complete synthetic league — pool, captains, teams, a drafted
            roster, a played season with stats and power rankings — to test every
            surface before the real draft. <span className="font-semibold text-neutral-800 dark:text-neutral-200">Admin-only:</span>{" "}
            while a mock season exists, <span className="font-semibold">you</span> (league ops) see it across the site
            (<Link href="/the-draft" className="text-thl-orange underline-offset-4 hover:underline">draft</Link>,{" "}
            <Link href="/standings" className="text-thl-orange underline-offset-4 hover:underline">standings</Link>,{" "}
            <Link href="/schedule" className="text-thl-orange underline-offset-4 hover:underline">schedule</Link>,{" "}
            <Link href="/leaderboards" className="text-thl-orange underline-offset-4 hover:underline">leaderboards</Link>),
            while the public keeps seeing the real season — no dummy players leak to
            visitors or the pool. All mock data is isolated and removed by Reset.
          </p>

          {summary && (
            <div className="mt-5 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950">
              {summary}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-6 pb-24 md:px-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Configure & seed">
          <div className="grid grid-cols-2 gap-3">
            <Num label="Players" value={players} min={8} max={60} onChange={setPlayers} />
            <Num label="Captains / teams" value={captains} min={2} max={8} onChange={setCaptains} />
            <Num label="Roster size" value={rosterSize} min={2} max={6} onChange={setRosterSize} />
            <Num label="Pick seconds" value={pickSeconds} min={10} max={120} step={5} onChange={setPickSeconds} />
          </div>
          <Btn disabled={pending || exists} onClick={() => run("Seeded", () => seedMockLeague(opts))}>
            1 · Seed pool, captains &amp; teams
          </Btn>
          <Btn disabled={pending || !exists} onClick={() => run("Drafted", () => runMockDraft())}>
            2 · Auto-run the draft
          </Btn>
          <Btn disabled={pending || !exists} onClick={() => run("Season simulated", () => simulateSeasonResults())}>
            3 · Simulate a season
          </Btn>
        </Card>

        <Card title="One-click & teardown">
          <p className="text-sm text-neutral-500">
            Build the entire demo in one go, or wipe it clean.
          </p>
          <Btn
            disabled={pending || exists}
            primary
            onClick={() => run("Full demo built", () => buildFullMockLeague(opts))}
          >
            Build full mock league
          </Btn>
          <Btn
            disabled={pending || !exists}
            danger
            onClick={() => run("Reset", () => resetMockLeague())}
          >
            Reset / remove mock league
          </Btn>
          {exists && (
            <Link
              href="/admin/draft"
              className="mt-3 inline-block text-sm font-bold text-thl-orange underline-offset-4 hover:underline"
            >
              Open the control room →
            </Link>
          )}
        </Card>
        </div>
      </section>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {children}
    </div>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  primary,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <Button
      variant={danger ? "destructive" : primary ? "default" : "outline"}
      size="lg"
      onClick={onClick}
      disabled={disabled}
      className="mt-3 w-full"
    >
      {children}
    </Button>
  );
}

function Num({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <Field label={label}>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}
