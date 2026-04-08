import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { env } from "../env";
import { schema } from "./schema";

function ensureLocalDatabaseDirectory(databaseUrl: string) {
  if (!databaseUrl.startsWith("file:")) {
    return;
  }

  const filePath = databaseUrl.replace(/^file:/, "");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

ensureLocalDatabaseDirectory(env.TURSO_DATABASE_URL);

export const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

export const dbReady = Promise.resolve().then(async () => {
  if (!env.isRemoteDatabase) {
    await client.execute("PRAGMA busy_timeout = 5000");
    await client.execute("PRAGMA foreign_keys = ON");
  }

  if (env.isTest || env.isLocalDev) {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });
  }
});
