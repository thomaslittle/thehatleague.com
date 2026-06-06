"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateFnfSettings } from "@/app/actions/fnf";

/** Convert an ISO timestamp to the `YYYY-MM-DDTHH:mm` a datetime-local wants. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Admin-only tournament settings card: Swiss rounds, playoff cut, best-of,
 *  start time, name. Styled to match the site's other forms. */
export function SettingsForm({
  tournamentId,
  name,
  swissRounds,
  swissGames,
  playoffBestOf,
  finalBestOf,
  playoffCut,
  startsAt,
  onClose,
}: {
  tournamentId: string;
  name: string;
  swissRounds: number;
  swissGames: number;
  playoffBestOf: number;
  finalBestOf: number;
  playoffCut: number;
  startsAt: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name,
    swissRounds: String(swissRounds),
    swissGames: String(swissGames),
    playoffBestOf: String(playoffBestOf),
    finalBestOf: String(finalBestOf),
    playoffCut: String(playoffCut),
    startsAt: toLocalInput(startsAt),
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = () =>
    startTransition(async () => {
      const res = await updateFnfSettings(tournamentId, {
        name: form.name.trim() || undefined,
        swissRounds: Number(form.swissRounds) || undefined,
        swissGames: Number(form.swissGames) || undefined,
        playoffBestOf: Number(form.playoffBestOf) || undefined,
        finalBestOf: Number(form.finalBestOf) || undefined,
        playoffCut: Number(form.playoffCut) || undefined,
        startsAt: form.startsAt
          ? new Date(form.startsAt).toISOString()
          : undefined,
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success("Settings saved.");
        router.refresh();
        onClose();
      }
    });

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        Swiss matches are a fixed game series scored <strong>3-1-0</strong>{" "}
        (2-0 = 3 pts, 1-1 = 1 pt each). Playoffs are best-of.
      </p>

      <Field label="Tournament name" htmlFor="fnf-name">
        <Input id="fnf-name" value={form.name} onChange={set("name")} />
      </Field>

      <section className="space-y-3">
        <SectionLabel>Swiss</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Rounds" htmlFor="fnf-rounds">
            <Input
              id="fnf-rounds"
              type="number"
              min={1}
              value={form.swissRounds}
              onChange={set("swissRounds")}
            />
          </Field>
          <Field label="Games / series" htmlFor="fnf-swiss-games">
            <Input
              id="fnf-swiss-games"
              type="number"
              min={1}
              value={form.swissGames}
              onChange={set("swissGames")}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <SectionLabel>Playoffs</SectionLabel>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Cut" htmlFor="fnf-cut">
            <Input
              id="fnf-cut"
              type="number"
              min={2}
              value={form.playoffCut}
              onChange={set("playoffCut")}
            />
          </Field>
          <Field label="Best of" htmlFor="fnf-po-bo">
            <Input
              id="fnf-po-bo"
              type="number"
              min={1}
              value={form.playoffBestOf}
              onChange={set("playoffBestOf")}
            />
          </Field>
          <Field label="Finals" htmlFor="fnf-final-bo">
            <Input
              id="fnf-final-bo"
              type="number"
              min={1}
              value={form.finalBestOf}
              onChange={set("finalBestOf")}
            />
          </Field>
        </div>
      </section>

      <Field
        label="Starts at"
        htmlFor="fnf-start"
        hint="Set in your local time — every player sees it in theirs."
      >
        <Input
          id="fnf-start"
          type="datetime-local"
          value={form.startsAt}
          onChange={set("startsAt")}
        />
      </Field>

      <div className="flex justify-end gap-2 border-t border-neutral-200 pt-5 dark:border-neutral-800">
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button
          onClick={save}
          disabled={pending}
          className="bg-gradient-to-r from-thl-orange to-amber-500 text-white shadow-sm transition hover:shadow-md hover:brightness-105"
        >
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold tracking-[0.18em] text-thl-orange uppercase">
      {children}
    </div>
  );
}
