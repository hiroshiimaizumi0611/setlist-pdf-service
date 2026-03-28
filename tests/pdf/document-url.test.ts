import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = {
    ...originalEnv,
    BETTER_AUTH_SECRET: "document-url-test-secret-32-chars",
    BETTER_AUTH_URL: "http://localhost:3000",
  };
  vi.resetModules();
});

afterEach(() => {
  process.env = { ...originalEnv };
  vi.resetModules();
});

describe("buildPdfDocumentUrl", () => {
  it("returns an absolute document url for the event and theme", async () => {
    const { buildPdfDocumentUrl } = await import("../../lib/pdf/document-url");

    expect(
      buildPdfDocumentUrl({
        eventId: "event-o-west",
        theme: "dark",
      }),
    ).toBe("http://localhost:3000/events/event-o-west/pdf/document?theme=dark");
  });

  it("round-trips optional token parameters", async () => {
    const { buildPdfDocumentUrl } = await import("../../lib/pdf/document-url");

    expect(
      buildPdfDocumentUrl({
        eventId: "event-o-west",
        theme: "light",
        token: "signed-token-value",
      }),
    ).toBe(
      "http://localhost:3000/events/event-o-west/pdf/document?theme=light&token=signed-token-value",
    );
  });
});
