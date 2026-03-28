import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = {
    ...originalEnv,
    BETTER_AUTH_SECRET: "document-token-test-secret-32-chars",
    BETTER_AUTH_URL: "http://localhost:3000",
  };
  vi.resetModules();
});

afterEach(() => {
  vi.useRealTimers();
  process.env = { ...originalEnv };
  vi.resetModules();
});

describe("pdf document token helpers", () => {
  it("encodes the event id, theme, and expiry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-28T00:00:00.000Z"));

    const { signPdfDocumentToken, verifyPdfDocumentToken } = await import(
      "../../lib/pdf/document-token"
    );

    const token = signPdfDocumentToken({
      eventId: "event-o-west",
      theme: "dark",
      expiresInSeconds: 3600,
    });

    const verified = verifyPdfDocumentToken(token);

    expect(token.split(".")).toHaveLength(2);
    expect(verified).toEqual({
      eventId: "event-o-west",
      theme: "dark",
      exp: 1774659600,
    });
  });

  it("rejects expired tokens", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-28T00:00:00.000Z"));

    const { signPdfDocumentToken, verifyPdfDocumentToken } = await import(
      "../../lib/pdf/document-token"
    );

    const token = signPdfDocumentToken({
      eventId: "event-o-west",
      theme: "light",
      expiresInSeconds: 60,
    });

    vi.setSystemTime(new Date("2026-03-28T00:01:01.000Z"));

    expect(verifyPdfDocumentToken(token)).toBeNull();
  });

  it("rejects tampered tokens", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-28T00:00:00.000Z"));

    const { signPdfDocumentToken, verifyPdfDocumentToken } = await import(
      "../../lib/pdf/document-token"
    );

    const token = signPdfDocumentToken({
      eventId: "event-o-west",
      theme: "light",
      expiresInSeconds: 60,
    });
    const tamperedToken = `${token.slice(0, -1)}x`;

    expect(verifyPdfDocumentToken(tamperedToken)).toBeNull();
  });
});
