// Server-only env access. The TanStack Start build shares the Next app's
// .env.local — Vite's envDir is set to the repo root so the same
// NEXT_PUBLIC_* names work for both runtimes. These reads only run inside
// createServerFn handlers, so no secret leaks to the client bundle.

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export const env = {
  get SUPABASE_URL() {
    return required(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL",
    );
  },
  get SUPABASE_PUBLISHABLE_KEY() {
    return required(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  },
  get SITE_URL() {
    return (
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"
    );
  },
  get DISCORD_ANNOUNCEMENTS_WEBHOOK_URL() {
    return process.env.DISCORD_ANNOUNCEMENTS_WEBHOOK_URL;
  },
};
