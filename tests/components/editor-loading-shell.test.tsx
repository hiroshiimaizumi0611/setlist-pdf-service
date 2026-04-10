import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
    expect(heading.querySelector("span")?.className).toContain(
      "motion-safe:[animation:animated-loading-text-shimmer_1.8s_linear_infinite]",
    );
    expect(screen.getByText("公演情報とセットリストを読み込んでいます。")).toBeInTheDocument();
    expect(screen.getByText("EVENT OVERVIEW")).toBeInTheDocument();
    expect(screen.getByText("SETLIST")).toBeInTheDocument();
  });
});
