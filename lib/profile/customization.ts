import type { Json } from "@/lib/supabase/types";

export const SOCIAL_LINKS = [
  { key: "x", label: "X / Twitter", placeholder: "https://x.com/yourhandle" },
  { key: "twitch", label: "Twitch", placeholder: "https://twitch.tv/yourhandle" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourhandle" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourhandle" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
] as const;

export type SocialLinkKey = (typeof SOCIAL_LINKS)[number]["key"];
export type SocialLinks = Partial<Record<SocialLinkKey, string>>;

export function parseSocialLinks(value: Json | null | undefined): SocialLinks {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const links: SocialLinks = {};
  for (const { key } of SOCIAL_LINKS) {
    const raw = value[key];
    if (typeof raw === "string" && raw.trim()) {
      links[key] = raw;
    }
  }
  return links;
}
