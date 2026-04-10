import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardShell } from "../../components/dashboard-shell";
import { EditorLoadingShell } from "../../components/loading-shells";

vi.mock("next/navigation", async () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("EditorLoadingShell", () => {
  it("shows the shared loading copy and recognizable editor sections", () => {
    render(<EditorLoadingShell />);

    const heading = screen.getByRole("heading", { name: "読み込み中..." });
    expect(heading).toHaveTextContent("読み込み中...");
    const shimmer = heading.querySelector("span");
    expect(shimmer).toBeInTheDocument();
    expect(shimmer?.className).toContain("motion-safe:");
    expect(screen.getByText("公演情報とセットリストを読み込んでいます。")).toBeInTheDocument();
    expect(screen.getByText("EVENT OVERVIEW")).toBeInTheDocument();
    expect(screen.getByText("SETLIST")).toBeInTheDocument();
  });

  it("keeps the dashboard shell title and description narrow", () => {
    const invalidShell = (
      <DashboardShell
        currentTheme="dark"
        sidebar={<div />}
        eyebrow="技術進行シート"
        // @ts-expect-error - arbitrary block nodes should not be accepted here
        title={<div>読み込み中...</div>}
        // @ts-expect-error - arbitrary block nodes should not be accepted here
        description={<div>公演情報とセットリストを読み込んでいます。</div>}
      >
        <div />
      </DashboardShell>
    );

    void invalidShell;
  });
});
