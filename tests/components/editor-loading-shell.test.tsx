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

    expect(screen.getByRole("heading", { name: "読み込み中..." })).toBeInTheDocument();
    expect(screen.getByText("公演情報とセットリストを読み込んでいます。")).toBeInTheDocument();
    expect(screen.getByText("EVENT OVERVIEW")).toBeInTheDocument();
    expect(screen.getByText("SETLIST")).toBeInTheDocument();
  });
});
