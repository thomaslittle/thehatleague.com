"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipChip } from "@/components/clips/clip-chip";
import { submitCombineProfile } from "@/app/actions/combine";
import { COMBINE_ROLES } from "@/lib/data/combine-roles";

export interface CombineInitial {
  showcase_clip_url: string | null;
  clip_urls: string[];
  preferred_role: string | null;
  secondary_role: string | null;
  availability: string | null;
  notes: string | null;
}

const MAX_CLIPS = 8;

function initialClips(initial: CombineInitial | null): string[] {
  const fromArray = initial?.clip_urls?.filter(Boolean) ?? [];
  if (fromArray.length > 0) return fromArray;
  if (initial?.showcase_clip_url) return [initial.showcase_clip_url];
  return [""];
}

/** In-pool players build / update their combine profile. */
export function CombineForm({ initial }: { initial: CombineInitial | null }) {
  const [pending, startTransition] = useTransition();
  // First-timers see the form open; returning players see a collapsed
  // summary with an Edit affordance instead.
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(initial === null);
  const [clips, setClips] = useState<string[]>(() => initialClips(initial));
  const [role, setRole] = useState(initial?.preferred_role ?? "");
  const [secondary, setSecondary] = useState(initial?.secondary_role ?? "");
  const [availability, setAvailability] = useState(initial?.availability ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const hasEntry = Boolean(initial) || saved;
  const savedClips = clips.map((c) => c.trim()).filter(Boolean);

  const updateClip = (i: number, value: string) =>
    setClips((prev) => prev.map((c, idx) => (idx === i ? value : c)));
  const addClip = () =>
    setClips((prev) => (prev.length >= MAX_CLIPS ? prev : [...prev, ""]));
  const removeClip = (i: number) =>
    setClips((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      return next.length > 0 ? next : [""];
    });

  const submit = () => {
    startTransition(async () => {
      const res = await submitCombineProfile({
        clipUrls: savedClips,
        preferredRole: role || null,
        secondaryRole: secondary || null,
        availability,
        notes,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Combine profile saved");
      setSaved(true);
      setEditing(false);
    });
  };

  // Already submitted and not actively editing — show a compact recap.
  if (hasEntry && !editing) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] text-emerald-600 uppercase dark:text-emerald-400">
              <Check className="h-3 w-3" aria-hidden /> On the board
            </div>
            <h2 className="mt-3 text-xl font-bold tracking-tight">Your combine profile</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Captains can scout you. Update it anytime before the draft.
            </p>
          </div>
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" aria-hidden /> Edit
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {role && <SummaryChip label="Role" value={role} />}
          {secondary && <SummaryChip label="Secondary" value={secondary} />}
          {availability && <SummaryChip label="Availability" value={availability} />}
          {savedClips.map((c, i) => (
            <ClipChip key={`${c}-${i}`} url={c} index={i} />
          ))}
        </div>
        {notes && <p className="mt-3 text-sm text-neutral-500">{notes}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950 md:p-8">
      <h2 className="text-xl font-bold tracking-tight">
        {hasEntry ? "Edit your combine profile" : "Your combine profile"}
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Give captains something to scout. Best clips, preferred role, when you can play.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Preferred role">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a role" />
            </SelectTrigger>
            <SelectContent>
              {COMBINE_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Secondary role">
          <Select value={secondary} onValueChange={setSecondary}>
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              {COMBINE_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field
        label="Showcase clips"
        hint="YouTube, Twitch, Streamable or a direct video link. Embeddable clips play right on your card."
        className="mt-4"
      >
        <div className="space-y-2">
          {clips.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={c}
                onChange={(e) => updateClip(i, e.target.value)}
                placeholder="https://youtube.com/… or a clip link"
              />
              {clips.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeClip(i)}
                  aria-label={`Remove clip ${i + 1}`}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition hover:border-rose-400 hover:text-rose-500 dark:border-neutral-800"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
          ))}
        </div>
        {clips.length < MAX_CLIPS && (
          <button
            type="button"
            onClick={addClip}
            className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-thl-orange transition hover:underline"
          >
            <Plus className="h-4 w-4" aria-hidden /> Add another clip
          </button>
        )}
      </Field>

      <Field label="Availability" className="mt-4">
        <Input
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          placeholder="e.g. Weeknights after 9pm ET"
        />
      </Field>

      <Field label="Notes for captains" className="mt-4">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Playstyle, mechanics, what you bring to a team…"
          rows={3}
        />
      </Field>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" disabled={pending} onClick={submit} className="flex-1">
          Save combine profile
        </Button>
        {hasEntry && (
          <Button
            variant="outline"
            size="lg"
            disabled={pending}
            onClick={() => setEditing(false)}
            className="sm:w-auto"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm dark:border-neutral-800 dark:bg-neutral-900">
      <span className="text-[10px] font-bold tracking-[0.16em] text-neutral-500 uppercase">
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}
