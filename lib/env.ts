// Centralised env access. Throws loudly if a required value is missing so we
// see it at boot, not while debugging a 500.

export const env = {
  SUPABASE_URL: required(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_PUBLISHABLE_KEY: required(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ),
  SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

function required<T>(value: T | undefined, name: string): T {
  if (value === undefined || value === "") {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}
