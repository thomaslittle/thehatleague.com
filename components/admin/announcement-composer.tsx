"use client";

import { useActionState } from "react";
import {
  createAnnouncement,
  type CreateAnnouncementState,
} from "@/app/actions/admin";
import { ArrowRight } from "@/components/icons/brand";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AnnouncementComposer() {
  const [state, action, pending] = useActionState<
    CreateAnnouncementState | undefined,
    FormData
  >(createAnnouncement, undefined);

  return (
    <form
      action={action}
      className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950"
    >
      <div className="text-[10px] font-bold tracking-[0.22em] text-thl-orange uppercase">
        New announcement
      </div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">
        Tell the league.
      </h2>

      <div className="mt-5 grid gap-5">
        <Field label="Title" htmlFor="title">
          <Input
            id="title"
            name="title"
            type="text"
            required
            minLength={4}
            maxLength={120}
            placeholder="e.g. Draft night locked — Friday July 19"
          />
        </Field>

        <Field
          label="Body"
          htmlFor="body"
          hint="Markdown is treated as plain text. Two blank lines = new paragraph."
        >
          <Textarea
            id="body"
            name="body"
            rows={8}
            required
            minLength={10}
            maxLength={4000}
            placeholder="What captains and players need to know…"
          />
        </Field>

        <label className="inline-flex items-center gap-3 text-sm">
          <Checkbox name="pinned" value="on" id="pinned" />
          <span>
            Pin to the top + show in the header utility strip site-wide.
          </span>
        </label>

        {state?.error && (
          <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {state.error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            name="publish_mode"
            value="publish"
            size="lg"
            disabled={pending}
          >
            {pending ? "Publishing…" : "Publish now"}
            {!pending && <ArrowRight className="h-4 w-4" />}
          </Button>
          <Button
            type="submit"
            name="publish_mode"
            value="draft"
            variant="secondary"
            size="lg"
            disabled={pending}
          >
            Save as draft
          </Button>
        </div>
      </div>
    </form>
  );
}
