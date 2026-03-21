import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { z } from "zod";

const nodeEnv = process.env.NODE_ENV ?? "development";
const isTest =
  nodeEnv === "test" ||
  process.env.VITEST === "true" ||
  Boolean(process.env.VITEST_WORKER_ID);
const isLocalDev = !isTest && nodeEnv !== "production";

function defaultLocalDatabaseUrl() {
  const filePath = path.join(
    process.cwd(),
    "node_modules",
    ".cache",
    "setlist-pdf-service",
    "local.sqlite",
  );

  return `file:${filePath.replace(/\\/g, "/")}`;
}

function defaultTestDatabaseUrl() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "setlist-pdf-service-"));
  const filePath = path.join(tempDir, "test.sqlite").replace(/\\/g, "/");

  return `file:${filePath}`;
}

const envSchema = z
  .object({
    BETTER_AUTH_SECRET: z.string().min(32).optional(),
    BETTER_AUTH_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    TURSO_DATABASE_URL: z.string().min(1).optional(),
    TURSO_AUTH_TOKEN: z.string().min(1).optional(),
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
    STRIPE_PRO_MONTHLY_PRICE_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  })
  .transform((raw) => {
    const defaultUrl = isTest
      ? defaultTestDatabaseUrl()
      : isLocalDev
        ? defaultLocalDatabaseUrl()
        : undefined;
    const betterAuthUrl =
      raw.BETTER_AUTH_URL ??
      raw.NEXT_PUBLIC_APP_URL ??
      (isTest || isLocalDev ? "http://localhost:3000" : undefined);
    const betterAuthSecret =
      raw.BETTER_AUTH_SECRET ??
      (isTest || isLocalDev
        ? "development-secret-for-better-auth-must-be-32-chars"
        : undefined);
    const tursoDatabaseUrl = raw.TURSO_DATABASE_URL ?? defaultUrl;

    if (!betterAuthUrl) {
      throw new Error("BETTER_AUTH_URL is required outside test/local development.");
    }

    if (!betterAuthSecret) {
      throw new Error(
        "BETTER_AUTH_SECRET is required outside test/local development.",
      );
    }

    if (!tursoDatabaseUrl) {
      throw new Error(
        "TURSO_DATABASE_URL is required outside test/local development.",
      );
    }

    const isRemoteDatabase = !tursoDatabaseUrl.startsWith("file:");

    if (isRemoteDatabase && !raw.TURSO_AUTH_TOKEN) {
      throw new Error("TURSO_AUTH_TOKEN is required for remote Turso databases.");
    }

    const hasSomeStripeConfig = Boolean(
      raw.STRIPE_SECRET_KEY ||
        raw.STRIPE_WEBHOOK_SECRET ||
        raw.STRIPE_PRO_MONTHLY_PRICE_ID,
    );
    const isStripeConfigured = Boolean(
      raw.STRIPE_SECRET_KEY &&
        raw.STRIPE_WEBHOOK_SECRET &&
        raw.STRIPE_PRO_MONTHLY_PRICE_ID,
    );

    if (hasSomeStripeConfig && !isStripeConfigured) {
      throw new Error(
        "STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and STRIPE_PRO_MONTHLY_PRICE_ID must be configured together.",
      );
    }

    return {
      BETTER_AUTH_SECRET: betterAuthSecret,
      BETTER_AUTH_URL: betterAuthUrl,
      TURSO_DATABASE_URL: tursoDatabaseUrl,
      TURSO_AUTH_TOKEN: raw.TURSO_AUTH_TOKEN,
      STRIPE_SECRET_KEY: raw.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: raw.STRIPE_WEBHOOK_SECRET,
      STRIPE_PRO_MONTHLY_PRICE_ID: raw.STRIPE_PRO_MONTHLY_PRICE_ID,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: raw.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      isTest,
      isLocalDev,
      isRemoteDatabase,
      isStripeConfigured,
    };
  });

export const env = envSchema.parse(process.env);
