import { describe, expect, it } from "vitest";
import { buildSetlistPdfLayout } from "../../lib/pdf/build-layout";
import { oWestEvent } from "../fixtures/o-west-event";

describe("buildSetlistPdfLayout", () => {
  it("splits long events across multiple pages and repeats the header title", () => {
    const layout = buildSetlistPdfLayout({
      event: oWestEvent,
      theme: "dark",
    });

    expect(layout.pages.length).toBeGreaterThan(1);
    expect(layout.pages.every((page) => page.header.title.includes("Spotify O-WEST"))).toBe(
      true,
    );
    expect(layout.pages.flatMap((page) => page.rows).length).toBe(oWestEvent.items.length);
  });

  it("formats header dates in Japan time", () => {
    const layout = buildSetlistPdfLayout({
      event: {
        ...oWestEvent,
        eventDate: new Date("2025-11-26T00:30:00+09:00"),
      },
      theme: "light",
    });

    expect(layout.pages[0]?.header.subtitle).toContain("2025.11.26");
  });
});
