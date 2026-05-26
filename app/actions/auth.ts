"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteOrigin } from "@/lib/origin";

const DISCORD_SCOPES = ["identify", "guilds", "guilds.members.read"].join(" ");

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
