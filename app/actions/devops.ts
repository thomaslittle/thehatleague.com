"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEVOPS_PITCH_MAX, DEVOPS_PITCH_MIN } from "@/lib/devops";

export interface DevopsApplicationState {
  ok?: boolean;
  error?: string;
}

export async function applyForDevops(
  _prev: DevopsApplicationState | undefined,
  formData: FormData,
): Promise<DevopsApplicationState> {
  const pitch = String(formData.get("pitch") ?? "").trim();

  if (pitch.length < DEVOPS_PITCH_MIN) {
    return {
      error: `Tell us a bit more — at least ${DEVOPS_PITCH_MIN} characters so league ops has something to read.`,
    };
  }
  if (pitch.length > DEVOPS_PITCH_MAX) {
    return {
      error: `Trim it to under ${DEVOPS_PITCH_MAX} characters — we'll DM you to flesh it out.`,
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
      is_devops_applicant: true,
      devops_pitch: pitch,
    })
    .eq("id", user.id);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function withdrawDevopsApplication() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { error } = await supabase
    .from("profiles")
    .update({ is_devops_applicant: false })
    .eq("id", user.id);
  if (error) {
    // Best-effort withdraw — log so we notice, don't surface to UI.
    console.error("withdrawDevopsApplication failed:", error);
  }

  revalidatePath("/dashboard");
}
