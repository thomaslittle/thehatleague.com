"use client";

import { useActionState, useMemo, useState } from "react";
import { ArrowRight } from "@/components/icons/brand";
import {
  updateProfileCustomization,
  type ProfileCustomizationState,
} from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  parseSocialLinks,
  SOCIAL_LINKS,
  type SocialLinks,
} from "@/lib/profile/customization";
import type { Json } from "@/lib/supabase/types";

export function ProfileCustomizationForm({
  bio,
  socialLinks,
  hasCustomAvatar,
  hasCustomBanner,
}: {
  bio: string | null;
  socialLinks: Json | null;
  hasCustomAvatar: boolean;
  hasCustomBanner: boolean;
}) {
  const [state, action, pending] = useActionState<
    ProfileCustomizationState | undefined,
    FormData
  >(updateProfileCustomization, undefined);
  const defaults = useMemo<SocialLinks>(
    () => parseSocialLinks(socialLinks),
    [socialLinks],
  );
  const [bioValue, setBioValue] = useState(bio ?? "");
  const fe = state?.fieldErrors ?? {};

  return (
    <form action={action} className="grid gap-7">
      <div>
        <div className="text-xs font-bold tracking-[0.18em] text-thl-orange uppercase">
          Public player card
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">
          Make your profile yours.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Upload a custom avatar, choose a player-page banner, add a short bio,
          and link the socials you want other players to find.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Custom avatar"
          htmlFor="avatar"
          hint="Square images work best. JPG, PNG, WebP, or GIF up to 2 MB."
          error={fe.avatar}
        >
          <Input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            invalid={!!fe.avatar}
            className="h-auto cursor-pointer py-3 file:mr-4 file:rounded-lg file:border-0 file:bg-thl-orange file:px-3 file:py-1.5 file:text-xs file:font-extrabold file:text-black"
          />
          {hasCustomAvatar && (
            <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
              <Checkbox name="remove_avatar" value="1" />
              Use my Discord avatar instead
            </label>
          )}
        </Field>

        <Field
          label="Profile banner"
          htmlFor="banner"
          hint="Wide 16:9 images work best. JPG, PNG, WebP, or GIF up to 5 MB."
          error={fe.banner}
        >
          <Input
            id="banner"
            name="banner"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            invalid={!!fe.banner}
            className="h-auto cursor-pointer py-3 file:mr-4 file:rounded-lg file:border-0 file:bg-thl-orange file:px-3 file:py-1.5 file:text-xs file:font-extrabold file:text-black"
          />
          {hasCustomBanner && (
            <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
              <Checkbox name="remove_banner" value="1" />
              Use the default THL field banner
            </label>
          )}
        </Field>
      </div>

      <Field
        label="Bio"
        htmlFor="bio"
        hint="Optional. Keep it short — rank notes, play style, availability, or trash talk."
        error={fe.bio}
      >
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={280}
          value={bioValue}
          onChange={(event) => setBioValue(event.target.value)}
          invalid={!!fe.bio}
          placeholder="Old man mechanics, midnight queue gremlin, comfortable on defense…"
        />
        <div className="mt-1.5 text-right text-xs tabular-nums text-neutral-500">
          {bioValue.length}/280
        </div>
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        {SOCIAL_LINKS.map((link) => (
          <Field
            key={link.key}
            label={link.label}
            htmlFor={`social_${link.key}`}
            error={fe[`social_${link.key}`]}
          >
            <Input
              id={`social_${link.key}`}
              name={`social_${link.key}`}
              type="url"
              defaultValue={defaults[link.key] ?? ""}
              placeholder={link.placeholder}
              invalid={!!fe[`social_${link.key}`]}
            />
          </Field>
        ))}
      </div>

      {state?.error && (
        <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {state.error}
        </p>
      )}

      <div className="flex flex-col items-stretch gap-3 border-t border-neutral-200 pt-2 sm:items-end dark:border-neutral-800">
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="h-12 rounded-xl bg-thl-orange px-6 text-sm font-extrabold text-black shadow-[0_14px_35px_-18px_rgba(247,97,3,0.9)] hover:bg-thl-orange-deep sm:min-w-64"
        >
          {pending ? "Saving profile…" : "Save public profile"}
          {!pending && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
}
