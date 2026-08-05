import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

const sentryBuildEnabled = Boolean(
  process.env.SENTRY_AUTH_TOKEN &&
  process.env.SENTRY_ORG &&
  process.env.SENTRY_PROJECT,
);
const release =
  process.env.GITHUB_SHA ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.npm_package_version ??
  "dev";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ...(sentryBuildEnabled
      ? [
          sentryVitePlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            release: { name: release },
            sourcemaps: { filesToDeleteAfterUpload: ["dist/**/*.map"] },
            telemetry: false,
          }),
        ]
      : []),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(release),
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
