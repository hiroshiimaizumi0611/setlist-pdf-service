import { describe, expect, it } from "vitest";
import { buildSetlistPdfLayout } from "../../lib/pdf/build-layout";
import { nagoyaRadhallEvent } from "../fixtures/nagoya-radhall-event";
import { oWestEvent } from "../fixtures/o-west-event";

function buildSyntheticEvent(items: Array<
  | {
      id: string;
      itemType: "song";
      title: string;
    }
  | {
      id: string;
      itemType: "mc" | "transition" | "heading";
      title: string;
    }
>) {
  const timestamp = new Date("2026-03-28T09:00:00.000Z");

  return {
    title: "2026.03.28 Density Check",
    venue: "RADHALL",
    eventDate: timestamp,
    notes: "Density test fixture",
    items: items.map((item, index) => ({
      id: item.id,
      eventId: "event-density-check",
      position: index + 1,
      itemType: item.itemType,
      title: item.title,
      artist: null,
      durationSeconds: null,
      notes: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })),
  };
}

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

    expect(firstLayout.pageCount).toBe(3);
    expect(firstLayout.pageCount).toBe(firstLayout.pages.length);
    expect(firstLayout.pages.map((page) => page.pageNumber)).toEqual(
      Array.from({ length: firstLayout.pageCount }, (_, index) => index + 1),
    );
    expect(firstLayout.pages.map((page) => page.rows.map((row) => row.id))).toEqual(
      secondLayout.pages.map((page) => page.rows.map((row) => row.id)),
    );
    expect(firstLayout.pages.map((page) => page.rows.length)).toEqual([18, 19, 5]);
    expect(firstLayout.pages[0]?.footer.text).toBe(`1 / ${firstLayout.pageCount}`);
    expect(
      firstLayout.pages.every((page) =>
        page.rows.every(
          (row, index) => index === 0 || row.top > page.rows[index - 1]!.top,
        ),
      ),
    ).toBe(true);
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
      rowVariant: "song",
      originalTitle:
        "This is an intentionally long title that should trigger the layout warning and truncation path",
      displayText: layout.pages[0]?.rows[0]?.displayText,
    });
  });

  it.each([
    {
      title: "uses relaxed density for low row counts",
      event: buildSyntheticEvent([
        { id: "row-1", itemType: "song", title: "Song 01" },
        { id: "row-2", itemType: "song", title: "Song 02" },
        { id: "row-3", itemType: "song", title: "Song 03" },
      ]),
      densityPreset: "relaxed",
      pageCount: 1,
    },
    {
      title: "uses standard density for medium row counts",
      event: buildSyntheticEvent([
        { id: "row-1", itemType: "song", title: "Song 01" },
        { id: "row-2", itemType: "song", title: "Song 02" },
        { id: "row-3", itemType: "song", title: "Song 03" },
        { id: "row-4", itemType: "song", title: "Song 04" },
        { id: "row-5", itemType: "song", title: "Song 05" },
        { id: "row-6", itemType: "song", title: "Song 06" },
        { id: "row-7", itemType: "song", title: "Song 07" },
        { id: "row-8", itemType: "song", title: "Song 08" },
      ]),
      densityPreset: "standard",
      pageCount: 1,
    },
    {
      title: "uses compact density for a high-density setlist that still fits on one page",
      event: buildSyntheticEvent([
        { id: "row-1", itemType: "song", title: "Song 01" },
        { id: "row-2", itemType: "song", title: "Song 02" },
        { id: "row-3", itemType: "song", title: "Song 03" },
        { id: "row-4", itemType: "song", title: "Song 04" },
        { id: "row-5", itemType: "song", title: "Song 05" },
        { id: "row-6", itemType: "song", title: "Song 06" },
        { id: "row-7", itemType: "song", title: "Song 07" },
        { id: "row-8", itemType: "song", title: "Song 08" },
        { id: "row-9", itemType: "song", title: "Song 09" },
        { id: "row-10", itemType: "song", title: "Song 10" },
        { id: "row-11", itemType: "song", title: "Song 11" },
        { id: "row-12", itemType: "song", title: "Song 12" },
        { id: "row-13", itemType: "song", title: "Song 13" },
        { id: "row-14", itemType: "mc", title: "MC" },
        { id: "row-15", itemType: "transition", title: "転換" },
        { id: "row-16", itemType: "heading", title: "EN" },
      ]),
      densityPreset: "compact",
      pageCount: 1,
    },
    {
      title: "keeps compact density and paginates once the layout gets too dense",
      event: buildSyntheticEvent(
        Array.from({ length: 21 }, (_, index) => ({
          id: `row-${index + 1}`,
          itemType: "song" as const,
          title: `Song ${String(index + 1).padStart(2, "0")}`,
        })),
      ),
      densityPreset: "compact",
      pageCount: 2,
    },
  ])("$title", ({ event, densityPreset, pageCount }) => {
    const layout = buildSetlistPdfLayout({
      event,
      theme: "dark",
    });

    expect(layout.densityPreset).toBe(densityPreset);
    expect(layout.pageCount).toBe(pageCount);
  });
});
