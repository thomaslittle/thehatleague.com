"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/lib/supabase/types";

const PROFILE_MEDIA_BUCKET = "profile-media";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const MAX_BANNER_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const SOCIAL_KEYS = ["x", "twitch", "youtube", "tiktok", "instagram"] as const;

export interface ProfileCustomizationState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeOptionalUrl(value: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function extensionForType(type: string) {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

function fileFromForm(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

async function uploadProfileImage({
  file,
  kind,
  userId,
}: {
  file: File;
  kind: "avatar" | "banner";
  userId: string;
}) {
  const supabase = await createSupabaseServerClient();
  const ext = extensionForType(file.type);
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(PROFILE_MEDIA_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from(PROFILE_MEDIA_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

export async function updateProfileCustomization(
  _prev: ProfileCustomizationState | undefined,
  formData: FormData,
): Promise<ProfileCustomizationState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const bio = textValue(formData, "bio");
  const avatar = fileFromForm(formData, "avatar");
  const banner = fileFromForm(formData, "banner");
  const fieldErrors: Record<string, string> = {};

  if (bio.length > 280) {
    fieldErrors.bio = "Keep your bio to 280 characters or less.";
  }

  if (avatar) {
    if (!ALLOWED_IMAGE_TYPES.has(avatar.type)) {
      fieldErrors.avatar = "Avatar must be a JPG, PNG, WebP, or GIF.";
    } else if (avatar.size > MAX_AVATAR_BYTES) {
      fieldErrors.avatar = "Avatar must be 2 MB or smaller.";
    }
  }

  if (banner) {
    if (!ALLOWED_IMAGE_TYPES.has(banner.type)) {
      fieldErrors.banner = "Banner must be a JPG, PNG, WebP, or GIF.";
    } else if (banner.size > MAX_BANNER_BYTES) {
      fieldErrors.banner = "Banner must be 5 MB or smaller.";
    }
  }

  const socialLinks: Record<(typeof SOCIAL_KEYS)[number], string> = {
    x: "",
    twitch: "",
    youtube: "",
    tiktok: "",
    instagram: "",
  };
  for (const key of SOCIAL_KEYS) {
    const raw = textValue(formData, `social_${key}`);
    if (!raw) continue;
    const normalized = normalizeOptionalUrl(raw);
    if (!normalized) {
      fieldErrors[`social_${key}`] = "Use a full URL starting with https://.";
    } else {
      socialLinks[key] = normalized;
    }
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  let avatarUrl: string | null | undefined;
  let bannerUrl: string | null | undefined;
  try {
    if (formData.get("remove_avatar") === "1") {
      avatarUrl = null;
    } else if (avatar) {
      avatarUrl = await uploadProfileImage({
        file: avatar,
        kind: "avatar",
        userId: user.id,
      });
    }

    if (formData.get("remove_banner") === "1") {
      bannerUrl = null;
    } else if (banner) {
      bannerUrl = await uploadProfileImage({
        file: banner,
        kind: "banner",
        userId: user.id,
      });
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `Couldn't upload profile image: ${error.message}`
          : "Couldn't upload profile image.",
    };
  }

  const updates: Database["public"]["Tables"]["profiles"]["Update"] = {
    bio: bio || null,
    social_links: socialLinks as unknown as Json,
    updated_at: new Date().toISOString(),
  };

  if (avatarUrl !== undefined) updates.profile_avatar_url = avatarUrl;
  if (bannerUrl !== undefined) updates.profile_banner_url = bannerUrl;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/pool");
  redirect("/dashboard?settings_saved=profile_card");
}
