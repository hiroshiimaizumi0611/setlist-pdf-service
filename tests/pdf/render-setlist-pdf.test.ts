import { PDFArray, PDFDocument, PDFStream } from "pdf-lib";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { buildSetlistPdfLayout } from "../../lib/pdf/build-layout";
import { renderSetlistPdf } from "../../lib/pdf/render-setlist-pdf";

async function getContentStreamStrings(pdfBytes: Uint8Array) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  const contents = page.node.Contents();

  if (!contents) {
    return [];
  }

  if (contents instanceof PDFStream) {
    return [contents.getContentsString()];
  }

  if (contents instanceof PDFArray) {
    return contents.asArray().map((entry) => {
      const stream = pdfDoc.context.lookup(entry, PDFStream);
      const rawBytes = stream.getContents();
      return inflateSync(rawBytes).toString("utf8");
    });
  }

  return [];
}

describe("renderSetlistPdf", () => {
  it("renders the shared row display text for long song titles", async () => {
    const event = {
      title: "2026.03.28 名古屋 RADHALL",
      venue: "RADHALL",
      eventDate: new Date("2026-03-28T09:00:00.000Z"),
      notes: "本番用セットリスト",
      updatedAt: new Date("2026-03-28T10:11:00.000Z"),
      items: [
        {
          id: "long-song-1",
          eventId: "event-long-title",
          position: 1,
          itemType: "song" as const,
          title:
            "This is an intentionally long title that should be preserved exactly as the shared layout display text",
          artist: null,
          durationSeconds: null,
          notes: null,
          createdAt: new Date("2026-03-01T00:00:00.000Z"),
          updatedAt: new Date("2026-03-01T00:00:00.000Z"),
        },
      ],
    };

    const layout = buildSetlistPdfLayout({
      event,
      theme: "light",
    });

    const expectedDisplayText = layout.pages[0]?.rows[0]?.displayText;

    expect(expectedDisplayText).toMatch(/…$/);
    expect(expectedDisplayText).toBeDefined();

    const pdfBytes = await renderSetlistPdf({
      event,
      theme: "light",
    });

    const contentStreams = await getContentStreamStrings(pdfBytes);
    const combinedContent = contentStreams.join("\n");

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.subarray(0, 4)).toEqual(
      new Uint8Array([0x25, 0x50, 0x44, 0x46]),
    );
    expect(pdfBytes.byteLength).toBeGreaterThan(500);
    expect(pdfBytes.byteLength).toBeLessThan(2_000_000);

    const songRowMatch = combinedContent.match(
      /1 0 0 1 126 640 Tm\s+<([0-9A-F]+)> Tj/,
    );

    expect(songRowMatch?.[1]).toBeDefined();
    expect(songRowMatch?.[1].length).toBe((expectedDisplayText ?? "").length * 4);
  }, 15_000);
});
