import { PDFArray, PDFDocument, PDFStream } from "pdf-lib";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { buildSetlistPdfLayout } from "../../lib/pdf/build-layout";
import { nagoyaRadhallEvent } from "../fixtures/nagoya-radhall-event";
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
  it("renders the shared display text for MC rows in the PDF stream", async () => {
    const layout = buildSetlistPdfLayout({
      event: nagoyaRadhallEvent,
      theme: "light",
    });

    expect(layout.pages[0]?.rows[3]?.displayText).toBe("[ MC ]");

    const pdfBytes = await renderSetlistPdf({
      event: nagoyaRadhallEvent,
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
    expect(combinedContent).toContain("1 0 0 1 126 640 Tm");
    expect(combinedContent).toContain("1 0 0 1 288.695 567 Tm");
    expect(combinedContent).toContain("124 499 m");
    expect(combinedContent).toContain("333 499 m");
  }, 15_000);
});
