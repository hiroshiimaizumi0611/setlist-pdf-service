import { defineConfig } from "playwright/test";

const playwrightAppUrl = "http://localhost:3000";
const playwrightAuthSecret =
  "development-secret-for-better-auth-must-be-32-chars";
const playwrightDatabaseUrl =
  "file:./node_modules/.cache/setlist-pdf-service/playwright.sqlite";

process.env.BETTER_AUTH_SECRET ??= playwrightAuthSecret;
process.env.BETTER_AUTH_URL ??= playwrightAppUrl;
process.env.NEXT_PUBLIC_APP_URL ??= playwrightAppUrl;
process.env.TURSO_DATABASE_URL ??= playwrightDatabaseUrl;

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: playwrightAppUrl,
  },
  webServer: {
    command:
      "npm run db:migrate && npm run build && npm run start -- --hostname 127.0.0.1 --port 3000",
    timeout: 180_000,
    url: playwrightAppUrl,
    // Reuse an already running local app to avoid port conflicts during iterative E2E work.
    reuseExistingServer: process.env.CI ? false : true,
    env: {
      BETTER_AUTH_SECRET: playwrightAuthSecret,
      BETTER_AUTH_URL: playwrightAppUrl,
      NEXT_PUBLIC_APP_URL: playwrightAppUrl,
      TURSO_DATABASE_URL: playwrightDatabaseUrl,
    },
  },
});
