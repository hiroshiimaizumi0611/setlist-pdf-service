import { defineConfig } from "drizzle-kit";
import { env } from "./lib/env";

const config = env.isRemoteDatabase
  ? defineConfig({
      schema: "./lib/db/schema.ts",
      out: "./drizzle",
      dialect: "turso",
      dbCredentials: {
        url: env.TURSO_DATABASE_URL,
        authToken: env.TURSO_AUTH_TOKEN,
      },
    })
  : defineConfig({
      schema: "./lib/db/schema.ts",
      out: "./drizzle",
      dialect: "sqlite",
      dbCredentials: {
        url: env.TURSO_DATABASE_URL,
      },
    });

export default config;
