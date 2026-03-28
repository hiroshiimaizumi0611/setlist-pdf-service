import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PdfDocument } from "../../components/pdf-document";
import { buildSetlistPdfLayout } from "../../lib/pdf/build-layout";
import { nagoyaRadhallEvent } from "../fixtures/nagoya-radhall-event";
import { oWestEvent } from "../fixtures/o-west-event";

function buildSyntheticEvent(
  items: Array<
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
  >,
) {
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

function requireElement(value: Element | null, message: string): HTMLElement {
  if (!value) {
    throw new Error(message);
  }

  return value as HTMLElement;
}

function scaleToMm(layoutSize: number, physicalSizeMm: number, value: number) {
  return `${Number(((value / layoutSize) * physicalSizeMm).toFixed(3))}mm`;
}

describe("PdfDocument", () => {
  it("renders print-ready paper markup for song, mc, transition, and heading rows", () => {
    const layout = buildSetlistPdfLayout({
      event: nagoyaRadhallEvent,
      theme: "light",
    });

    const { container } = render(
      <PdfDocument
        event={{
          updatedAt: new Date("2026-03-21T00:00:00.000Z"),
        }}
        layout={layout}
      />,
    );

    const document = screen.getByRole("document", {
      name: "Setlist PDF document",
    });
    const page = screen.getByRole("article", {
      name: "Setlist PDF page 1",
    });
    const styleTag = requireElement(
      container.querySelector("style"),
      "expected print styles",
    );
    const songRows = Array.from(
      page.querySelectorAll('[data-row-variant="song"]'),
    ) as HTMLElement[];
    const songRow = requireElement(songRows[0] ?? null, "expected song row");
    const laterSongRow = requireElement(
      songRows[1] ?? null,
      "expected later song row",
    );
    const mcRow = requireElement(
      page.querySelector('[data-row-variant="mc"]'),
      "expected mc row",
    );
    const transitionRow = requireElement(
      page.querySelector('[data-row-variant="transition"]'),
      "expected transition row",
    );
    const headingRow = requireElement(
      page.querySelector('[data-row-variant="heading"]'),
      "expected heading row",
    );

    expect(document).toHaveAttribute("data-theme", "light");
    expect(styleTag.textContent).toContain("@page");
    expect(page).toHaveStyle({ width: "210mm", height: "297mm" });
    expect(document).toHaveAttribute("data-density-preset", "standard");
    expect(within(page).getByText("SETLIST_PRODUCTION_SHEET")).toBeInTheDocument();
    expect(within(page).getByText("2026.03.28 名古屋 RADHALL")).toBeInTheDocument();
    expect(within(songRow).getByText("M01")).toBeInTheDocument();
    expect(within(songRow).getByText("緑")).toBeInTheDocument();
    expect(songRow).toHaveAttribute("data-title-treatment", "song");
    expect(laterSongRow).toHaveAttribute("data-title-treatment", "song");
    expect(within(mcRow).getByText("[ MC ]")).toBeInTheDocument();
    expect(within(mcRow).queryByText("M04")).not.toBeInTheDocument();
    expect(mcRow).toHaveAttribute("data-centering-family", "callout");
    expect(within(transitionRow).getByText("--")).toBeInTheDocument();
    expect(within(transitionRow).getByText("転換")).toBeInTheDocument();
    expect(transitionRow).toHaveAttribute("data-row-variant", "transition");
    expect(transitionRow).toHaveAttribute("data-centering-family", "callout");
    expect(within(headingRow).getAllByText("EN")).toHaveLength(1);
    expect(headingRow).toHaveAttribute("data-title-treatment", "heading");
    expect(within(page).getByText("UPDATED_AT: 2026/03/21 09:00")).toBeInTheDocument();
    expect(within(page).getByText("1 / 1")).toBeInTheDocument();
  });

  it("keeps multi-page rendered rows tied to the shared layout positions", () => {
    const layout = buildSetlistPdfLayout({
      event: oWestEvent,
      theme: "dark",
    });

    expect(layout.pageCount).toBe(3);

    render(
      <PdfDocument
        event={{
          updatedAt: oWestEvent.updatedAt,
        }}
        layout={layout}
      />,
    );

    const firstPage = screen.getByRole("article", {
      name: "Setlist PDF page 1",
    });
    const secondPage = screen.getByRole("article", {
      name: "Setlist PDF page 2",
    });
    const thirdPage = screen.getByRole("article", {
      name: "Setlist PDF page 3",
    });
    const firstRowOnSecondPage = requireElement(
      secondPage.querySelector("[data-pdf-row]"),
      "expected positioned row on second page",
    );
    const firstRowOnThirdPage = requireElement(
      thirdPage.querySelector("[data-pdf-row]"),
      "expected positioned row on third page",
    );

    expect(screen.getAllByRole("article", { name: /Setlist PDF page/ })).toHaveLength(
      layout.pageCount,
    );
    expect(firstPage.querySelectorAll("[data-pdf-row]")).toHaveLength(
      layout.pages[0]!.rows.length,
    );
    expect(secondPage.querySelectorAll("[data-pdf-row]")).toHaveLength(
      layout.pages[1]!.rows.length,
    );
    expect(thirdPage.querySelectorAll("[data-pdf-row]")).toHaveLength(
      layout.pages[2]!.rows.length,
    );
    expect(within(firstPage).getByText(layout.pages[0]!.footer.text)).toBeInTheDocument();
    expect(firstRowOnSecondPage).toHaveAttribute(
      "data-row-top",
      String(layout.pages[1]!.rows[0]!.top),
    );
    expect(firstRowOnSecondPage).toHaveAttribute(
      "data-row-height",
      String(layout.pages[1]!.rows[0]!.height),
    );
    expect(firstRowOnSecondPage).toHaveStyle({ position: "absolute" });
    expect(firstRowOnSecondPage).toHaveStyle({
      top: scaleToMm(layout.pageSize.height, 297, layout.pages[1]!.rows[0]!.top),
      height: scaleToMm(layout.pageSize.height, 297, layout.pages[1]!.rows[0]!.height),
    });
    expect(firstRowOnThirdPage).toHaveStyle({
      top: scaleToMm(layout.pageSize.height, 297, layout.pages[2]!.rows[0]!.top),
      height: scaleToMm(layout.pageSize.height, 297, layout.pages[2]!.rows[0]!.height),
    });
    expect(within(secondPage).getByText(layout.pages[1]!.footer.text)).toBeInTheDocument();
    expect(within(thirdPage).getByText(layout.pages[2]!.footer.text)).toBeInTheDocument();
  });

  it("exposes the selected density preset through the shared dark document structure", () => {
    const relaxedLayout = buildSetlistPdfLayout({
      event: buildSyntheticEvent([
        { id: "row-1", itemType: "song", title: "Song 01" },
        { id: "row-2", itemType: "song", title: "Song 02" },
        { id: "row-3", itemType: "transition", title: "転換" },
      ]),
      theme: "dark",
    });

    const { rerender } = render(
      <PdfDocument
        event={{
          updatedAt: new Date("2026-03-21T00:00:00.000Z"),
        }}
        layout={relaxedLayout}
      />,
    );

    const relaxedDocument = screen.getByRole("document", {
      name: "Setlist PDF document",
    });
    const relaxedSongRows = screen
      .getByRole("article", {
        name: "Setlist PDF page 1",
      })
      .querySelectorAll('[data-row-variant="song"]');

    expect(relaxedLayout.densityPreset).toBe("relaxed");
    expect(relaxedDocument).toHaveAttribute("data-theme", "dark");
    expect(relaxedDocument).toHaveAttribute("data-density-preset", "relaxed");
    expect(relaxedSongRows[0]).toHaveAttribute("data-density-preset", "relaxed");

    const compactLayout = buildSetlistPdfLayout({
      event: oWestEvent,
      theme: "dark",
    });

    rerender(
      <PdfDocument
        event={{
          updatedAt: oWestEvent.updatedAt,
        }}
        layout={compactLayout}
      />,
    );

    const compactDocument = screen.getByRole("document", {
      name: "Setlist PDF document",
    });
    const compactFirstRow = requireElement(
      screen
        .getByRole("article", {
          name: "Setlist PDF page 1",
        })
        .querySelector("[data-pdf-row]"),
      "expected compact document row",
    );

    expect(compactLayout.densityPreset).toBe("compact");
    expect(compactDocument).toHaveAttribute("data-density-preset", "compact");
    expect(compactFirstRow).toHaveAttribute("data-density-preset", "compact");
  });
});
