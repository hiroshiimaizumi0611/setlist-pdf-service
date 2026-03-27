import { describe, expect, it } from "vitest";
import { buildSetlistPdfLayout } from "../../lib/pdf/build-layout";
import { nagoyaRadhallEvent } from "../fixtures/nagoya-radhall-event";
import { oWestEvent } from "../fixtures/o-west-event";

describe("buildSetlistPdfLayout", () => {
  it("keeps multi-page arrays stable and exposes a shared page count", () => {
    const firstLayout = buildSetlistPdfLayout({
      event: oWestEvent,
      theme: "dark",
    });
    const secondLayout = buildSetlistPdfLayout({
      event: oWestEvent,
      theme: "dark",
    });

    expect(firstLayout.pageCount).toBeGreaterThan(1);
    expect(firstLayout.pageCount).toBe(firstLayout.pages.length);
    expect(firstLayout.pages.map((page) => page.pageNumber)).toEqual(
      Array.from({ length: firstLayout.pageCount }, (_, index) => index + 1),
    );
    expect(firstLayout.pages.map((page) => page.rows.map((row) => row.id))).toEqual(
      secondLayout.pages.map((page) => page.rows.map((row) => row.id)),
    );
    expect(firstLayout.pages[0]?.footer.text).toBe(`1 / ${firstLayout.pageCount}`);
  });

  it("assigns distinct row semantics for song, mc, transition, and heading rows", () => {
    const layout = buildSetlistPdfLayout({
      event: nagoyaRadhallEvent,
      theme: "light",
    });

    expect(layout.pages[0]?.rows.map((row) => row.variant)).toEqual([
      "song",
      "song",
      "song",
      "mc",
      "song",
      "song",
      "transition",
      "heading",
    ]);
    expect(layout.pages[0]?.rows.map((row) => row.cueLabel)).toEqual([
      "M01",
      "M02",
      "M03",
      null,
      "M04",
      "M05",
      "--",
      "EN",
    ]);
    expect(layout.pages[0]?.rows.map((row) => row.displayText)).toEqual([
      "緑",
      "ねえ！もう実験は終わりにしよう！",
      "Dendrobium",
      "[ MC ]",
      "いちごジャムにチーズ",
      "純闇Dinner",
      "転換",
      "EN",
    ]);
  });

  it("warns when a song title is too long for the shared layout", () => {
    const layout = buildSetlistPdfLayout({
      event: {
        title: "2026.03.28 名古屋 RADHALL",
        venue: "RADHALL",
        eventDate: new Date("2026-03-28T09:00:00.000Z"),
        notes: "本番用セットリスト",
        items: [
          {
            id: "long-song-1",
            eventId: "event-long-title",
            position: 1,
            itemType: "song" as const,
            title:
              "This is an intentionally long title that should trigger the layout warning and truncation path",
            artist: null,
            durationSeconds: null,
            notes: null,
            createdAt: new Date("2026-03-01T00:00:00.000Z"),
            updatedAt: new Date("2026-03-01T00:00:00.000Z"),
          },
        ],
      },
      theme: "dark",
    });

    expect(layout.pages[0]?.rows[0]?.displayText).toMatch(/…$/);
    expect(layout.warnings).toHaveLength(1);
    expect(layout.warnings[0]).toMatchObject({
      type: "long-title",
      rowId: "long-song-1",
      originalTitle:
        "This is an intentionally long title that should trigger the layout warning and truncation path",
      displayText: layout.pages[0]?.rows[0]?.displayText,
    });
  });
});
