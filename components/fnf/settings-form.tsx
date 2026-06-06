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
  swissBestOf,
  playoffBestOf,
  playoffCut,
  startsAt,
  onClose,
}: {
  tournamentId: string;
  name: string;
  swissRounds: number;
  swissBestOf: number;
  playoffBestOf: number;
  playoffCut: number;
  startsAt: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name,
    swissRounds: String(swissRounds),
    swissBestOf: String(swissBestOf),
    playoffBestOf: String(playoffBestOf),
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
        swissBestOf: Number(form.swissBestOf) || undefined,
        playoffBestOf: Number(form.playoffBestOf) || undefined,
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
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-5">
        <div className="text-xs font-bold tracking-[0.18em] text-thl-orange uppercase">
          League ops
        </div>
        <h2 className="mt-2 text-xl font-bold tracking-tight">
          Tournament settings
        </h2>
        <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
          Format controls for this week&apos;s bracket. Changes apply going
          forward.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Name"
          htmlFor="fnf-name"
          className="sm:col-span-2"
        >
          <Input id="fnf-name" value={form.name} onChange={set("name")} />
        </Field>

        <Field
          label="Swiss rounds"
          htmlFor="fnf-rounds"
          hint="Rounds before the playoff cut."
        >
          <Input
            id="fnf-rounds"
            type="number"
            min={1}
            value={form.swissRounds}
            onChange={set("swissRounds")}
          />
        </Field>

        <Field
          label="Playoff cut"
          htmlFor="fnf-cut"
          hint="Top teams that make playoffs."
        >
          <Input
            id="fnf-cut"
            type="number"
            min={2}
            value={form.playoffCut}
            onChange={set("playoffCut")}
          />
        </Field>

        <Field
          label="Swiss best of"
          htmlFor="fnf-swiss-bo"
          hint="Games per Swiss series."
        >
          <Input
            id="fnf-swiss-bo"
            type="number"
            min={1}
            value={form.swissBestOf}
            onChange={set("swissBestOf")}
          />
        </Field>

        <Field
          label="Playoff best of"
          htmlFor="fnf-po-bo"
          hint="Games per playoff series."
        >
          <Input
            id="fnf-po-bo"
            type="number"
            min={1}
            value={form.playoffBestOf}
            onChange={set("playoffBestOf")}
          />
        </Field>

        <Field
          label="Starts at"
          htmlFor="fnf-start"
          hint="Set in your local time — each player sees it in theirs."
        >
          <Input
            id="fnf-start"
            type="datetime-local"
            value={form.startsAt}
            onChange={set("startsAt")}
          />
        </Field>
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
