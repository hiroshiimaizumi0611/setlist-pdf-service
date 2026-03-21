import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };
const AUTH_TEST_TIMEOUT_MS = 30_000;

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("better auth", () => {
  it(
    "requires explicit auth and database config for production-like imports",
    async () => {
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

      vi.resetModules();
      await expect(import("../../lib/env")).rejects.toThrow();
      vi.resetModules();
    },
    AUTH_TEST_TIMEOUT_MS,
  );

  it(
    "signs up a free user with email and password",
    async () => {
      const { auth } = await import("../../lib/auth");
      const email = `staff+${Date.now()}@example.com`;

      const result = await auth.api.signUpEmail({
        body: {
          email,
          password: "correct horse battery staple",
          name: "Staff",
        },
      });

      expect(result.user.email).toBe(email);
    },
    AUTH_TEST_TIMEOUT_MS,
  );

  it(
    "looks up the session created during email sign-up",
    async () => {
      const { auth } = await import("../../lib/auth");
      const email = `session+${Date.now()}@example.com`;

      const result = await auth.api.signUpEmail({
        body: {
          email,
          password: "correct horse battery staple",
          name: "Staff Session",
        },
        returnHeaders: true,
      });

      const session = await auth.api.getSession({
        headers: new Headers({
          cookie: result.headers.get("set-cookie")?.split(";")[0] ?? "",
        }),
      });

      expect(session?.user.email).toBe(email);
      expect(session?.session.userId).toBe(result.response.user.id);
    },
    AUTH_TEST_TIMEOUT_MS,
  );

  it(
    "handles sign-up and session lookup through the Next auth route",
    async () => {
      const { GET, POST } = await import("../../app/api/auth/[...all]/route");
      const email = `route+${Date.now()}@example.com`;

      const signUpResponse = await POST(
        new Request("http://localhost:3000/api/auth/sign-up/email", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin: "http://localhost:3000",
          },
          body: JSON.stringify({
            email,
            password: "correct horse battery staple",
            name: "Route Staff",
          }),
        }),
      );

      expect(signUpResponse.status).toBe(200);

      const signUpPayload = await signUpResponse.json();
      expect(signUpPayload.user.email).toBe(email);

      const sessionCookie =
        signUpResponse.headers.get("set-cookie")?.split(";")[0];
      expect(sessionCookie).toBeTruthy();

      const sessionResponse = await GET(
        new Request("http://localhost:3000/api/auth/get-session", {
          headers: {
            cookie: sessionCookie ?? "",
            origin: "http://localhost:3000",
          },
        }),
      );

      expect(sessionResponse.status).toBe(200);

      const sessionPayload = await sessionResponse.json();
      expect(sessionPayload.user.email).toBe(email);
      expect(sessionPayload.session.userId).toBe(signUpPayload.user.id);
    },
    AUTH_TEST_TIMEOUT_MS,
  );
});
