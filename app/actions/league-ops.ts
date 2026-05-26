"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ADMIN_PITCH_MAX, ADMIN_PITCH_MIN } from "@/lib/league-ops";

export interface LeagueOpsApplicationState {
  ok?: boolean;
  error?: string;
}

export async function applyForLeagueOps(
  _prev: LeagueOpsApplicationState | undefined,
  formData: FormData,
): Promise<LeagueOpsApplicationState> {
  const pitch = String(formData.get("pitch") ?? "").trim();

  if (pitch.length < ADMIN_PITCH_MIN) {
    return {
      error: `Tell us a bit more — at least ${ADMIN_PITCH_MIN} characters so league ops has something to read.`,
    };
  }
  if (pitch.length > ADMIN_PITCH_MAX) {
    return {
      error: `Trim it to under ${ADMIN_PITCH_MAX} characters — we'll DM you to flesh it out.`,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/signin?redirect=/dashboard");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      is_admin_applicant: true,
      admin_pitch: pitch,
    })
    .eq("id", user.id);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function withdrawLeagueOpsApplication() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { error } = await supabase
    .from("profiles")
    .update({ is_admin_applicant: false })
    .eq("id", user.id);
  if (error) {
    // Best-effort withdraw — log so we notice, don't surface to UI.
    console.error("withdrawLeagueOpsApplication failed:", error);
  }

  revalidatePath("/dashboard");
}
