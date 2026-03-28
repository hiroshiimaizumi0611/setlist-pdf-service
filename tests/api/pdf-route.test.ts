import { describe, expect, it, vi, beforeEach } from "vitest";
import { oWestEvent } from "../fixtures/o-west-event";

const mocks = vi.hoisted(() => ({
  requireAuthSession: vi.fn(),
  findEventWithItemsById: vi.fn(),
  signPdfDocumentToken: vi.fn(),
  buildPdfDocumentUrl: vi.fn(),
  generatePdfFromDocument: vi.fn(),
}));

vi.mock("../../lib/auth", () => ({
  requireAuthSession: mocks.requireAuthSession,
}));

vi.mock("../../lib/repositories/event-repository", () => ({
  findEventWithItemsById: mocks.findEventWithItemsById,
}));

vi.mock("../../lib/pdf/document-token", () => ({
  signPdfDocumentToken: mocks.signPdfDocumentToken,
}));

vi.mock("../../lib/pdf/document-url", () => ({
  buildPdfDocumentUrl: mocks.buildPdfDocumentUrl,
}));

vi.mock("../../lib/pdf/generate-pdf-from-document", () => ({
  generatePdfFromDocument: mocks.generatePdfFromDocument,
}));

import { GET, runtime } from "../../app/api/events/[eventId]/pdf/route";

describe("GET /api/events/[eventId]/pdf", () => {
  beforeEach(() => {
    mocks.requireAuthSession.mockReset();
    mocks.findEventWithItemsById.mockReset();
    mocks.signPdfDocumentToken.mockReset();
    mocks.buildPdfDocumentUrl.mockReset();
    mocks.generatePdfFromDocument.mockReset();
  });

  it("returns a downloadable PDF response", async () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

    mocks.requireAuthSession.mockResolvedValue({
      user: { id: oWestEvent.ownerUserId },
    });
    mocks.findEventWithItemsById.mockResolvedValue(oWestEvent);
    mocks.signPdfDocumentToken.mockReturnValue("signed-token");
    mocks.buildPdfDocumentUrl.mockReturnValue(
      "https://app.example.com/events/event-o-west/pdf/document?theme=dark&token=signed-token",
    );
    mocks.generatePdfFromDocument.mockResolvedValue(pdfBytes);

    const response = await GET(
      new Request("http://localhost/api/events/event-o-west/pdf?theme=dark"),
      {
        params: Promise.resolve({ eventId: oWestEvent.id }),
      },
    );

    expect(runtime).toBe("nodejs");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain(
      'attachment; filename="20251126_spotify-o-west_setlist.pdf"',
    );
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(pdfBytes);
    expect(mocks.signPdfDocumentToken).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: oWestEvent.id,
        theme: "dark",
      }),
    );
    expect(mocks.buildPdfDocumentUrl).toHaveBeenCalledWith({
      eventId: oWestEvent.id,
      theme: "dark",
      token: "signed-token",
    });
    expect(mocks.generatePdfFromDocument).toHaveBeenCalledWith({
      documentUrl:
        "https://app.example.com/events/event-o-west/pdf/document?theme=dark&token=signed-token",
    });
  });

  it("falls back to an unknown-venue filename when venue is missing", async () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

    mocks.requireAuthSession.mockResolvedValue({
      user: { id: oWestEvent.ownerUserId },
    });
    mocks.findEventWithItemsById.mockResolvedValue({
      ...oWestEvent,
      venue: null,
      title: "Fallback title should not be used",
    });
    mocks.signPdfDocumentToken.mockReturnValue("signed-token");
    mocks.buildPdfDocumentUrl.mockReturnValue(
      "https://app.example.com/events/event-o-west/pdf/document?theme=light&token=signed-token",
    );
    mocks.generatePdfFromDocument.mockResolvedValue(pdfBytes);

    const response = await GET(new Request("http://localhost/api/events/event-o-west/pdf"), {
      params: Promise.resolve({ eventId: oWestEvent.id }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toContain(
      'attachment; filename="20251126_unknown-venue_setlist.pdf"',
    );
  });

  it("formats filename dates in Japan time", async () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

    mocks.requireAuthSession.mockResolvedValue({
      user: { id: oWestEvent.ownerUserId },
    });
    mocks.findEventWithItemsById.mockResolvedValue({
      ...oWestEvent,
      eventDate: new Date("2025-11-26T00:30:00+09:00"),
    });
    mocks.signPdfDocumentToken.mockReturnValue("signed-token");
    mocks.buildPdfDocumentUrl.mockReturnValue(
      "https://app.example.com/events/event-o-west/pdf/document?theme=light&token=signed-token",
    );
    mocks.generatePdfFromDocument.mockResolvedValue(pdfBytes);

    const response = await GET(new Request("http://localhost/api/events/event-o-west/pdf"), {
      params: Promise.resolve({ eventId: oWestEvent.id }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toContain(
      'attachment; filename="20251126_spotify-o-west_setlist.pdf"',
    );
  });
});
