import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildSetlistPdfLayout } from "../../lib/pdf/build-layout";
import { nagoyaRadhallEvent } from "../fixtures/nagoya-radhall-event";
import { oWestEvent } from "../fixtures/o-west-event";
import { PdfPreviewPage } from "../../components/pdf-preview-page";

describe("PdfPreviewPage", () => {
  it("renders the shared layout rows in a centered workspace and hides the placeholder shell copy", () => {
    const layout = buildSetlistPdfLayout({
      event: nagoyaRadhallEvent,
      theme: "dark",
    });

    render(
      <PdfPreviewPage
        event={{
          id: "event-nagoya-radhall",
          ownerUserId: "user-1",
          title: "2026.03.28 名古屋 RADHALL",
          venue: nagoyaRadhallEvent.venue,
          eventDate: nagoyaRadhallEvent.eventDate,
          notes: "本番用セットリスト",
          createdAt: new Date("2026-03-21T00:00:00.000Z"),
          updatedAt: new Date("2026-03-21T00:00:00.000Z"),
          items: [],
        }}
        layout={layout}
        currentTheme="dark"
        downloadHref="/api/events/event-nagoya-radhall/pdf?theme=dark"
      />,
    );

    expect(screen.getByRole("main")).toHaveClass("min-h-screen");
    expect(screen.getByRole("heading", { name: "2026.03.28 名古屋 RADHALL" })).toBeInTheDocument();
    expect(screen.getByText("M01")).toBeInTheDocument();
    expect(screen.getByText("M02")).toBeInTheDocument();
    expect(screen.getByText("[ MC ]")).toBeInTheDocument();
    expect(screen.getByText("--")).toBeInTheDocument();
    expect(screen.getByText("EN")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "PDF出力" })).toHaveAttribute(
      "href",
      "/api/events/event-nagoya-radhall/pdf?theme=dark",
    );
    expect(screen.getByText("PDFテーマ切替")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "DARK" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("出力サイズ選択")).toBeInTheDocument();
    expect(screen.getByText("A4 (210 x 297mm)")).toBeInTheDocument();
    expect(screen.getByText("ページ継続確認")).toBeInTheDocument();
    expect(screen.getByText("最終更新時刻:")).toBeInTheDocument();
    expect(screen.queryByText("紙面プレビューは次のタスクで実装")).not.toBeInTheDocument();
    expect(screen.queryByText("右パネルは後続タスクで展開")).not.toBeInTheDocument();
    expect(screen.queryByText("preview shell receives the exact model used by the PDF renderer.")).not.toBeInTheDocument();
  });

  it("shows layout warnings derived from the shared model", () => {
    const layout = buildSetlistPdfLayout({
      event: {
        title: "2026.03.28 名古屋 RADHALL",
        venue: "RADHALL",
        eventDate: new Date("2026-03-28T09:00:00.000Z"),
        notes: "本番用セットリスト",
        items: [
          {
            id: "long-song-1",
            eventId: "event-nagoya-radhall",
            position: 1,
            itemType: "song" as const,
            title:
              "This is an intentionally long title that should trigger the layout warning and truncation path",
            artist: null,
            durationSeconds: null,
            notes: null,
            createdAt: new Date("2026-03-21T00:00:00.000Z"),
            updatedAt: new Date("2026-03-21T00:00:00.000Z"),
          },
        ],
      },
      theme: "light",
    });

    render(
      <PdfPreviewPage
        event={{
          id: "event-nagoya-radhall",
          ownerUserId: "user-1",
          title: "2026.03.28 名古屋 RADHALL",
          venue: "RADHALL",
          eventDate: new Date("2026-03-28T09:00:00.000Z"),
          notes: "本番用セットリスト",
          createdAt: new Date("2026-03-21T00:00:00.000Z"),
          updatedAt: new Date("2026-03-21T00:00:00.000Z"),
          items: [],
        }}
        layout={layout}
        currentTheme="light"
        downloadHref="/api/events/event-nagoya-radhall/pdf?theme=light"
      />,
    );

    const inspector = screen.getByRole("complementary");
    expect(within(inspector).getByText("レイアウト警告")).toBeInTheDocument();
    expect(within(inspector).getByText(/Title for song long-song-1 was truncated/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LIGHT" })).toHaveAttribute("aria-current", "page");
  });

  it("renders multiple shared pages when the layout spans more than one page", () => {
    const layout = buildSetlistPdfLayout({
      event: oWestEvent,
      theme: "dark",
    });

    render(
      <PdfPreviewPage
        event={{
          id: oWestEvent.id,
          ownerUserId: oWestEvent.ownerUserId,
          title: oWestEvent.title,
          venue: oWestEvent.venue,
          eventDate: oWestEvent.eventDate,
          notes: oWestEvent.notes,
          createdAt: oWestEvent.createdAt,
          updatedAt: oWestEvent.updatedAt,
          items: [],
        }}
        layout={layout}
        currentTheme="dark"
        downloadHref={`/api/events/${oWestEvent.id}/pdf?theme=dark`}
      />,
    );

    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });
});
