import { describe, expect, it } from "vitest";
import { oWestEvent } from "../fixtures/o-west-event";
import { renderSetlistPdf } from "../../lib/pdf/render-setlist-pdf";

describe("renderSetlistPdf", () => {
  it(
    "renders a downloadable PDF buffer for a real event fixture",
    async () => {
      const pdfBytes = await renderSetlistPdf({
        event: oWestEvent,
        theme: "dark",
      });

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.subarray(0, 4)).toEqual(
        new Uint8Array([0x25, 0x50, 0x44, 0x46]),
      );
      expect(pdfBytes.byteLength).toBeGreaterThan(500);
      expect(pdfBytes.byteLength).toBeLessThan(2_000_000);
    },
    15_000,
  );
});
