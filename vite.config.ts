import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(
      process.env.GITHUB_SHA?.slice(0, 7) ??
        process.env.npm_package_version ??
        "dev",
    ),
  },
  build: {
    sourcemap: "hidden",
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    exclude: [...configDefaults.exclude, "e2e/**"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/data.ts",
        "src/types.ts",
        "src/vite-env.d.ts",
        "src/test/**",
        "src/**/*.test.{ts,tsx}",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        statements: 70,
        branches: 60,
      },
    },
  },
});
