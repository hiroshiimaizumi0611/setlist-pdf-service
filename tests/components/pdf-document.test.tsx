import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PdfDocument } from "../../components/pdf-document";
import { buildSetlistPdfLayout } from "../../lib/pdf/build-layout";
import { nagoyaRadhallEvent } from "../fixtures/nagoya-radhall-event";

function requireElement(value: Element | null, message: string): HTMLElement {
  if (!value) {
    throw new Error(message);
  }

  return value as HTMLElement;
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
    const songRow = requireElement(
      page.querySelector('[data-row-variant="song"]'),
      "expected song row",
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
    expect(within(page).getByText("SETLIST_PRODUCTION_SHEET")).toBeInTheDocument();
    expect(within(page).getByText("2026.03.28 名古屋 RADHALL")).toBeInTheDocument();
    expect(within(songRow).getByText("M01")).toBeInTheDocument();
    expect(within(songRow).getByText("緑")).toBeInTheDocument();
    expect(within(mcRow).getByText("[ MC ]")).toBeInTheDocument();
    expect(within(mcRow).queryByText("M04")).not.toBeInTheDocument();
    expect(within(transitionRow).getByText("--")).toBeInTheDocument();
    expect(within(transitionRow).getByText("転換")).toBeInTheDocument();
    expect(within(headingRow).getAllByText("EN")).toHaveLength(1);
    expect(within(page).getByText("UPDATED_AT: 2026/03/21 09:00")).toBeInTheDocument();
    expect(within(page).getByText("1 / 1")).toBeInTheDocument();
  });
});
