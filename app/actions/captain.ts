"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CAPTAIN_PITCH_MAX, CAPTAIN_PITCH_MIN } from "@/lib/captain";

export interface CaptainApplicationState {
  ok?: boolean;
  error?: string;
}

export async function applyForCaptain(
  _prev: CaptainApplicationState | undefined,
  formData: FormData,
): Promise<CaptainApplicationState> {
  const pitch = String(formData.get("pitch") ?? "").trim();

  if (pitch.length < CAPTAIN_PITCH_MIN) {
    return {
      error: `Tell us a bit more — at least ${CAPTAIN_PITCH_MIN} characters so league ops has something to read.`,
    };
  }
  if (pitch.length > CAPTAIN_PITCH_MAX) {
    return {
      error: `Trim it to under ${CAPTAIN_PITCH_MAX} characters — we'll DM you to flesh it out.`,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/signin?redirect=/captains");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      is_captain_applicant: true,
      captain_pitch: pitch,
    })
    .eq("id", user.id);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/captains");
  return { ok: true };
}

export async function withdrawCaptainApplication() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { error } = await supabase
    .from("profiles")
    .update({ is_captain_applicant: false })
    .eq("id", user.id);
  if (error) {
    // Don't surface to UI — withdraw is best-effort. Log so we notice.
    console.error("withdrawCaptainApplication failed:", error);
  }

  revalidatePath("/captains");
  revalidatePath("/dashboard");
}
