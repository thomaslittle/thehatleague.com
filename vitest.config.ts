import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests for the pure draft/tournament helpers. The `@/*` alias mirrors
// tsconfig so test files can import via the same paths as app code.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
});
