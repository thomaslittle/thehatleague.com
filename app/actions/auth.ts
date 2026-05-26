"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

const DISCORD_SCOPES = ["identify", "guilds", "guilds.members.read"].join(" ");

async function siteOrigin() {
  // Prefer the deployment URL from the request — falls back to env in CI.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return env.SITE_URL;
}

export async function signInWithDiscord(formData: FormData) {
  const redirectTo = (formData.get("redirect") as string | null) ?? "/dashboard";
  const supabase = await createSupabaseServerClient();
  const origin = await siteOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      scopes: DISCORD_SCOPES,
    },
  });

  if (error || !data?.url) {
    redirect(`/signin?error=${encodeURIComponent(error?.message ?? "unknown")}`);
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
