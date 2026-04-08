import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildSetlistPdfLayout } from "../../lib/pdf/build-layout";
import { nagoyaRadhallEvent } from "../fixtures/nagoya-radhall-event";
import { oWestEvent } from "../fixtures/o-west-event";
import { PdfPreviewPage } from "../../components/pdf-preview-page";

function buildPreviewPageProps() {
  const layout = buildSetlistPdfLayout({
    event: nagoyaRadhallEvent,
    theme: "dark",
  });
  const event = {
    id: "event-nagoya-radhall",
    ownerUserId: "user-1",
    title: "2026.03.28 名古屋 RADHALL",
    venue: nagoyaRadhallEvent.venue,
    eventDate: nagoyaRadhallEvent.eventDate,
    notes: "本番用セットリスト",
    createdAt: new Date("2026-03-21T00:00:00.000Z"),
    updatedAt: new Date("2026-03-21T00:00:00.000Z"),
    items: [],
  };

  return {
    event,
    layout,
    currentTheme: "dark" as const,
    currentPlan: "free" as const,
    requestedPresetId: "standard-dark" as const,
    activePresetId: "standard-dark" as const,
    documentHref:
      "http://localhost:3000/events/event-nagoya-radhall/pdf/document?theme=dark&preset=standard-dark",
    downloadHref: "/api/events/event-nagoya-radhall/pdf?theme=dark&preset=standard-dark",
  };
}

describe("PdfPreviewPage", () => {
  it(
    "embeds the real document route in the workspace shell and hides direct paper rows",
    () => {
    const props = buildPreviewPageProps();
    const { layout, documentHref } = props;

    expect(layout.densityPreset).toBe("standard");

    render(<PdfPreviewPage {...props} />);

    expect(screen.getByRole("main")).toHaveClass("min-h-screen");
    expect(screen.getByRole("heading", { name: "2026.03.28 名古屋 RADHALL" })).toBeInTheDocument();
    const previewRegion = screen.getByRole("region", { name: "紙面プレビュー" });
    const embeddedPreview = within(previewRegion).getByTitle("紙面プレビュー");
    expect(embeddedPreview).toHaveAttribute("src", documentHref);
    expect(screen.getByRole("link", { name: "PDF出力" })).toHaveAttribute(
      "href",
      "/api/events/event-nagoya-radhall/pdf?theme=dark&preset=standard-dark",
    );
    expect(screen.getByRole("link", { name: "PDF出力" })).not.toHaveAttribute("target");
    expect(screen.getByText("PDFテーマ切替")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "DARK" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("出力サイズ選択")).toBeInTheDocument();
    expect(screen.getByText("A4 (210 x 297mm)")).toBeInTheDocument();
    expect(screen.getByText("PDF出力プリセット")).toBeInTheDocument();
    expect(screen.getByText("preview selectable / export gated")).toBeInTheDocument();
    expect(screen.getByText("Pro preset は preview できます。出力時のみ Pro が必要です。")).toBeInTheDocument();
    expect(screen.getByText("Standard Light")).toBeInTheDocument();
    expect(screen.getByText("Large Type")).toBeInTheDocument();
    expect(screen.getAllByText("Pro").length).toBeGreaterThan(0);
    expect(screen.getByText("Large Type で足元でも読みやすく")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Standard Dark" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Large Type" })).toHaveAttribute(
      "href",
      "/events/event-nagoya-radhall/pdf?theme=dark&preset=large-type",
    );
    expect(screen.getByText("ページ継続確認")).toBeInTheDocument();
    expect(screen.getByText("最終更新時刻:")).toBeInTheDocument();
    expect(screen.queryByText("M01")).not.toBeInTheDocument();
    expect(screen.queryByText("M02")).not.toBeInTheDocument();
    expect(screen.queryByText("[ MC ]")).not.toBeInTheDocument();
    expect(screen.queryByText("--")).not.toBeInTheDocument();
    expect(screen.queryByText("EN")).not.toBeInTheDocument();
    expect(screen.queryByText("紙面プレビューは次のタスクで実装")).not.toBeInTheDocument();
    expect(screen.queryByText("右パネルは後続タスクで展開")).not.toBeInTheDocument();
    expect(screen.queryByText("preview shell receives the exact model used by the PDF renderer.")).not.toBeInTheDocument();
    },
    20_000,
  );

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
        currentPlan="free"
        requestedPresetId="standard-light"
        activePresetId="standard-light"
        documentHref="http://localhost:3000/events/event-nagoya-radhall/pdf/document?theme=light&preset=standard-light"
        downloadHref="/api/events/event-nagoya-radhall/pdf?theme=light&preset=standard-light"
      />,
    );

    const inspector = screen.getByRole("complementary");
    expect(within(inspector).getByText("レイアウト警告")).toBeInTheDocument();
    expect(within(inspector).getByText(/Title for song long-song-1 was truncated/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LIGHT" })).toHaveAttribute("aria-current", "page");
  });

  it("shows the shared page count while keeping the preview itself embedded", () => {
    const layout = buildSetlistPdfLayout({
      event: oWestEvent,
      theme: "dark",
    });
    const documentHref = `http://localhost:3000/events/${oWestEvent.id}/pdf/document?theme=dark`;

    expect(layout.densityPreset).toBe("compact");

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
        currentPlan="free"
        requestedPresetId="standard-dark"
        activePresetId="standard-dark"
        documentHref={`${documentHref}&preset=standard-dark`}
        downloadHref={`/api/events/${oWestEvent.id}/pdf?theme=dark&preset=standard-dark`}
      />,
    );

    expect(screen.getByText("3 pages")).toBeInTheDocument();
    expect(screen.getByTitle("紙面プレビュー")).toHaveAttribute(
      "src",
      `${documentHref}&preset=standard-dark`,
    );
    expect(screen.queryByText("1 / 3")).not.toBeInTheDocument();
    expect(screen.queryByText("2 / 3")).not.toBeInTheDocument();
    expect(screen.queryByText("3 / 3")).not.toBeInTheDocument();
  });

  it("keeps relaxed density preview and download links aligned to the shared layout source", () => {
    const layout = buildSetlistPdfLayout({
      event: {
        title: "2026.03.28 Relaxed Density Check",
        venue: "RADHALL",
        eventDate: new Date("2026-03-28T09:00:00.000Z"),
        notes: "Density test fixture",
        items: [
          {
            id: "row-1",
            eventId: "event-relaxed-density",
            position: 1,
            itemType: "song" as const,
            title: "Song 01",
            artist: null,
            durationSeconds: null,
            notes: null,
            createdAt: new Date("2026-03-28T09:00:00.000Z"),
            updatedAt: new Date("2026-03-28T09:00:00.000Z"),
          },
          {
            id: "row-2",
            eventId: "event-relaxed-density",
            position: 2,
            itemType: "song" as const,
            title: "Song 02",
            artist: null,
            durationSeconds: null,
            notes: null,
            createdAt: new Date("2026-03-28T09:00:00.000Z"),
            updatedAt: new Date("2026-03-28T09:00:00.000Z"),
          },
          {
            id: "row-3",
            eventId: "event-relaxed-density",
            position: 3,
            itemType: "song" as const,
            title: "Song 03",
            artist: null,
            durationSeconds: null,
            notes: null,
            createdAt: new Date("2026-03-28T09:00:00.000Z"),
            updatedAt: new Date("2026-03-28T09:00:00.000Z"),
          },
        ],
      },
      theme: "light",
    });
    const documentHref =
      "http://localhost:3000/events/event-relaxed-density/pdf/document?theme=light";
    const downloadHref = "/api/events/event-relaxed-density/pdf?theme=light";

    expect(layout.densityPreset).toBe("relaxed");
    expect(layout.pageCount).toBe(1);

    render(
      <PdfPreviewPage
        event={{
          id: "event-relaxed-density",
          ownerUserId: "user-1",
          title: "2026.03.28 Relaxed Density Check",
          venue: "RADHALL",
          eventDate: new Date("2026-03-28T09:00:00.000Z"),
          notes: "Density test fixture",
          createdAt: new Date("2026-03-21T00:00:00.000Z"),
          updatedAt: new Date("2026-03-21T00:00:00.000Z"),
          items: [],
        }}
        layout={layout}
        currentTheme="light"
        currentPlan="free"
        requestedPresetId="standard-light"
        activePresetId="standard-light"
        documentHref={`${documentHref}&preset=standard-light`}
        downloadHref={`${downloadHref}&preset=standard-light`}
      />,
    );

    expect(screen.getByText("1 pages")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "PDF出力" })).toHaveAttribute(
      "href",
      `${downloadHref}&preset=standard-light`,
    );
    expect(screen.getByTitle("紙面プレビュー")).toHaveAttribute(
      "src",
      `${documentHref}&preset=standard-light`,
    );
  });

  it("lets free users preview Large Type without the old blocked banner", () => {
    const props = buildPreviewPageProps();

    render(
      <PdfPreviewPage
        {...props}
        requestedPresetId="large-type"
        activePresetId="large-type"
        blockedPresetId="large-type"
        documentHref="http://localhost:3000/events/event-nagoya-radhall/pdf/document?theme=dark&preset=large-type"
      />,
    );

    expect(screen.getByRole("link", { name: "Large Type" })).toHaveAttribute(
      "href",
      "/events/event-nagoya-radhall/pdf?theme=dark&preset=large-type",
    );
    expect(screen.getByRole("link", { name: "Large Type" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Large Type" })).toHaveAttribute(
      "href",
      "/events/event-nagoya-radhall/pdf?theme=dark&preset=large-type",
    );
    expect(screen.getByRole("link", { name: "Standard Dark" })).toHaveAttribute(
      "href",
      "/events/event-nagoya-radhall/pdf?theme=dark&preset=standard-dark",
    );
    expect(screen.getByRole("link", { name: "DARK" })).toHaveAttribute(
      "href",
      "/events/event-nagoya-radhall/pdf?theme=dark&preset=large-type",
    );
    expect(screen.getByRole("link", { name: "LIGHT" })).toHaveAttribute(
      "href",
      "/events/event-nagoya-radhall/pdf?theme=light&preset=large-type",
    );
    expect(
      within(screen.getByRole("link", { name: "Large Type" })).getByText(
        "preview available / export requires Pro",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Large Type は Pro プランで利用できます。")).not.toBeInTheDocument();
    expect(screen.getByTitle("紙面プレビュー")).toHaveAttribute(
      "src",
      "http://localhost:3000/events/event-nagoya-radhall/pdf/document?theme=dark&preset=large-type",
    );
  });

  it("opens an export gate modal for free users previewing Large Type", () => {
    const props = buildPreviewPageProps();

    render(
      <PdfPreviewPage
        {...props}
        requestedPresetId="large-type"
        activePresetId="large-type"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "PDF出力" }));

    const dialog = screen.getByRole("dialog", { name: "PDF出力の制限" });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("このプリセットで出力するにはProが必要です")).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "標準プリセットで出力" })).toHaveAttribute(
      "href",
      "/api/events/event-nagoya-radhall/pdf?theme=dark&preset=standard-dark",
    );
    expect(within(dialog).getByRole("link", { name: "Proにアップグレード" })).toHaveAttribute(
      "href",
      "/settings/billing",
    );
    expect(within(dialog).getByRole("button", { name: "キャンセル" })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "キャンセル" }));

    expect(screen.queryByRole("dialog", { name: "PDF出力の制限" })).not.toBeInTheDocument();
  });

  it("lets pro users select every preset via preview-aligned URLs", () => {
    const props = buildPreviewPageProps();

    render(
      <PdfPreviewPage
        {...props}
        currentPlan="pro"
        requestedPresetId="large-type"
        activePresetId="large-type"
        documentHref="http://localhost:3000/events/event-nagoya-radhall/pdf/document?theme=dark&preset=large-type"
        downloadHref="/api/events/event-nagoya-radhall/pdf?theme=dark&preset=large-type"
      />,
    );

    expect(screen.getByRole("link", { name: "Large Type" })).toHaveAttribute(
      "href",
      "/events/event-nagoya-radhall/pdf?theme=dark&preset=large-type",
    );
    expect(screen.getByRole("link", { name: "Large Type" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Compact" })).toHaveAttribute(
      "href",
      "/events/event-nagoya-radhall/pdf?theme=dark&preset=compact",
    );
    expect(screen.getByRole("link", { name: "PDF出力" })).toHaveAttribute(
      "href",
      "/api/events/event-nagoya-radhall/pdf?theme=dark&preset=large-type",
    );
    expect(screen.getByTitle("紙面プレビュー")).toHaveAttribute(
      "src",
      "http://localhost:3000/events/event-nagoya-radhall/pdf/document?theme=dark&preset=large-type",
    );
  });
});
