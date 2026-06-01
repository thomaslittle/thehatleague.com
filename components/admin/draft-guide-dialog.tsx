"use client";

import { useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/**
 * "How it works" CTA + dialog explaining the draft engine, the OBS overlay
 * studio, and the mock lab. Surfaced from the control room and the mock lab.
 */
export function DraftGuideButton({ label = "How it works" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-700 transition hover:border-thl-orange hover:text-thl-orange dark:border-neutral-700 dark:text-neutral-300"
          >
            <HelpCircle className="h-3.5 w-3.5" aria-hidden />
            {label}
          </button>
        }
      />
      <DialogContent className="max-h-[85vh] w-[min(94vw,720px)] !max-w-none overflow-y-auto">
        <DialogTitle>
          <span className="block text-[10px] font-bold tracking-[0.24em] text-thl-orange uppercase">
            League ops guide
          </span>
          <span className="mt-1 block text-2xl font-bold tracking-tight">
            Running a Hat League draft
          </span>
        </DialogTitle>

        <div className="mt-5 space-y-6 text-sm">
          <Section title="1 · Set up the draft">
            <Step n="Teams">Create one team per captain (“Create teams from captains”).</Step>
            <Step n="Settings">Set roster size &amp; pick timer, then choose a seed method.</Step>
            <Step n="Order">Seed the draft order — snake by default (order reverses each round).</Step>
          </Section>

          <Section title="2 · Run it live">
            <Step n="Start">“Start draft” puts the first team <b>On Deck</b> with the clock stopped.</Step>
            <Step n="Begin the clock">Hit <b>“Start [team]&apos;s pick”</b> when you&apos;re ready — that starts the timer.</Step>
            <Step n="Pick">Press <kbd className="rounded bg-neutral-200 px-1 dark:bg-neutral-800">/</kbd> to search, pick a player, and Draft them. The clock stops, the reveal auto-plays on the overlay, and the next team goes On Deck.</Step>
            <Step n="Controls">Pause / ±15s / Auto-pick now (for an AFK captain) / Undo / Set on-clock (jump to any team).</Step>
            <Step n="Move a player">Hover a player on a roster card and use the ⇄ to trade them to another team.</Step>
          </Section>

          <Section title="3 · Stream it with OBS">
            <Step n="Enable">Turn on overlays once to mint your secure browser-source URLs.</Step>
            <Step n="Program">Add the <b>On the Clock</b> source — it shows who&apos;s picking, the timer, who&apos;s up next, and auto-plays the “pick is in” reveal. Keep it up all draft.</Step>
            <Step n="Add more">Ticker, Top Prospect, Up Next, Team Roster, Best Available, Draft Board, Lower Third are independent sources — add the ones you want and position / show-hide them in OBS.</Step>
            <Step n="Live controls">Toggle the timer, up-next &amp; recent-picks, set the reveal hold &amp; sound, and push lower-third / ticker text — all hit the stream instantly.</Step>
          </Section>

          <Section title="Mock Lab — practice safely">
            <p className="text-neutral-600 dark:text-neutral-400">
              <a href="/admin/mock" className="font-semibold text-thl-orange hover:underline">/admin/mock</a> spins up a
              fake league to rehearse on. <b>Seed</b> builds a pool, captains &amp; teams; <b>Auto-run the draft</b>
              {" "}drafts a full board; <b>Simulate a season</b> plays games so standings / stats populate. While a mock
              exists, only you (league ops) see it across the site — the public still sees the real season.{" "}
              <b>Reset</b> wipes it clean.
            </p>
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-[11px] font-bold tracking-[0.22em] text-thl-orange uppercase">{title}</h3>
      <div className="mt-2.5 space-y-2">{children}</div>
    </section>
  );
}

function Step({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 shrink-0 rounded-md bg-thl-orange/15 px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] text-thl-orange uppercase">
        {n}
      </span>
      <p className="text-neutral-700 dark:text-neutral-300">{children}</p>
    </div>
  );
}
