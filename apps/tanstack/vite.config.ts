import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import { resolve } from "node:path";

// TanStack Start configuration. Mirrors the conventions used in the
// Next.js app at the repo root — same Supabase env vars, same brand
// fonts, same shadcn-style design tokens — but rendered/served by
// TanStack Router + Vite instead of Next 16.
const repoRoot = resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
  // Pull the shared .env files (incl. .env.local) into process.env so
  // server functions can read NEXT_PUBLIC_* names without a VITE_ prefix.
  // Vite normally only exposes VITE_*-prefixed vars; this opt-in copy keeps
  // the two apps on a single env file.
  const loaded = loadEnv(mode, repoRoot, "");
  for (const [key, value] of Object.entries(loaded)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    server: { port: 3001 },
    publicDir: resolve(__dirname, "../../public"),
    envDir: repoRoot,
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    // Inject public Supabase config into the client bundle so the
    // browser Supabase client (used by Realtime channels) can connect
    // without a VITE_ prefix on the .env keys.
    define: {
      __SUPABASE_URL__: JSON.stringify(loaded.NEXT_PUBLIC_SUPABASE_URL ?? ""),
      __SUPABASE_PUB_KEY__: JSON.stringify(
        loaded.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
      ),
    },
    plugins: [tanstackStart(), nitro(), react(), tailwindcss()],
  };
});
