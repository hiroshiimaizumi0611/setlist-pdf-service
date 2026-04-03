import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { mockPush, mockRefresh } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
}));

vi.mock("next/navigation", async () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));
import { ExportPdfButton } from "../../components/export-pdf-button";
import { PdfPreviewLoadingShell } from "../../components/loading-shells";

describe("PDF export loading affordances", () => {
  it("shows a full-screen loading overlay immediately after clicking the preview CTA", () => {
    const { container } = render(
      <div className="backdrop-blur-md">
        <ExportPdfButton href="/api/events/event-1/pdf?theme=dark" currentTheme="dark" />
      </div>,
    );

    expect(screen.queryByText("PDFプレビューを準備中...")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PDF出力" }));

    expect(screen.getByText("PDFプレビューを準備中...")).toBeInTheDocument();
    const status = screen.getByRole("status", { name: "PDFプレビューの読み込み状況" });
    expect(status).toBeInTheDocument();
    expect(container).not.toContainElement(status);
    expect(document.body).toContainElement(status);
    expect(mockPush).toHaveBeenCalledWith("/events/event-1/pdf?theme=dark");
  });

  it("renders a centered loading status for the pdf preview route", () => {
    render(<PdfPreviewLoadingShell />);

    expect(screen.getByText("PDFプレビューを準備中...")).toBeInTheDocument();
    expect(screen.getByText("用紙レイアウトと埋め込みプレビューを読み込んでいます。")).toBeInTheDocument();
    const status = screen.getByRole("status", { name: "PDFプレビューの読み込み状況" });
    expect(status).toBeInTheDocument();
    const overlay = status.closest("div.fixed");
    expect(overlay).toHaveClass("fixed");
    expect(overlay).toHaveClass("inset-0");
    expect(overlay).toHaveClass("z-[90]");
  });
});
