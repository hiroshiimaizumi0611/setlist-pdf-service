import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

function resetProductionLikeEnv() {
  process.env = {
    ...originalEnv,
    NODE_ENV: "production",
    VITEST: "",
    VITEST_WORKER_ID: "",
  };

  delete process.env.BETTER_AUTH_SECRET;
  delete process.env.BETTER_AUTH_URL;
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.TURSO_DATABASE_URL;
  delete process.env.TURSO_AUTH_TOKEN;
  delete process.env.CI;
  delete process.env.GITHUB_ACTIONS;
  delete process.env.VERCEL;
}

afterEach(() => {
  process.env = { ...originalEnv };
  vi.resetModules();
});

describe("env build defaults", () => {
  it("allows local production builds to use development defaults", async () => {
    resetProductionLikeEnv();
    process.env.NEXT_PHASE = "phase-production-build";

    const { env } = await import("../../lib/env");

    expect(env.BETTER_AUTH_URL).toBe("http://localhost:3000");
    expect(env.BETTER_AUTH_SECRET).toBe(
      "development-secret-for-better-auth-must-be-32-chars",
    );
    expect(env.TURSO_DATABASE_URL).toMatch(
      /^file:.*node_modules\/\.cache\/setlist-pdf-service\/local\.sqlite$/,
    );
  });

  it("requires explicit config for managed production builds", async () => {
    resetProductionLikeEnv();
    process.env.NEXT_PHASE = "phase-production-build";
    process.env.CI = "true";

    await expect(import("../../lib/env")).rejects.toThrow(
      "BETTER_AUTH_URL is required outside test/local development.",
    );
  });

  it("treats CI=1 as a managed production build", async () => {
    resetProductionLikeEnv();
    process.env.NEXT_PHASE = "phase-production-build";
    process.env.CI = "1";

    await expect(import("../../lib/env")).rejects.toThrow(
      "BETTER_AUTH_URL is required outside test/local development.",
    );
  });
});
