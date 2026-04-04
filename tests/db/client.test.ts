import { afterEach, describe, expect, it, vi } from "vitest";

const mockExecute = vi.fn();
const mockMigrate = vi.fn();
const mockCreateClient = vi.fn(() => ({
  execute: mockExecute,
}));
const mockDrizzle = vi.fn(() => ({ mocked: true }));

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("dbReady local migration behavior", () => {
  it("runs migrations for local development file databases", async () => {
    vi.doMock("@/lib/env", () => ({
      env: {
        TURSO_DATABASE_URL: "file:/tmp/setlist-local.sqlite",
        TURSO_AUTH_TOKEN: undefined,
        isRemoteDatabase: false,
        isTest: false,
        isLocalDev: true,
      },
    }));
    vi.doMock("@libsql/client", () => ({
      createClient: mockCreateClient,
    }));
    vi.doMock("drizzle-orm/libsql", () => ({
      drizzle: mockDrizzle,
    }));
    vi.doMock("drizzle-orm/libsql/migrator", () => ({
      migrate: mockMigrate,
    }));

    const { dbReady } = await import("../../lib/db/client");

    await dbReady;

    expect(mockExecute).toHaveBeenCalledWith("PRAGMA foreign_keys = ON");
    expect(mockMigrate).toHaveBeenCalledTimes(1);
  });

  it("does not run migrations for remote production databases", async () => {
    vi.doMock("@/lib/env", () => ({
      env: {
        TURSO_DATABASE_URL: "libsql://example.turso.io",
        TURSO_AUTH_TOKEN: "token",
        isRemoteDatabase: true,
        isTest: false,
        isLocalDev: false,
      },
    }));
    vi.doMock("@libsql/client", () => ({
      createClient: mockCreateClient,
    }));
    vi.doMock("drizzle-orm/libsql", () => ({
      drizzle: mockDrizzle,
    }));
    vi.doMock("drizzle-orm/libsql/migrator", () => ({
      migrate: mockMigrate,
    }));

    const { dbReady } = await import("../../lib/db/client");

    await dbReady;

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockMigrate).not.toHaveBeenCalled();
  });
});
