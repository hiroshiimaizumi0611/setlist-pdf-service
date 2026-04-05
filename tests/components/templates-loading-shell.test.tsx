import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TemplatesLoadingShell } from "../../components/loading-shells";

vi.mock("next/navigation", async () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("TemplatesLoadingShell", () => {
  it("shows the shared loading copy and recognizable templates sections", () => {
    render(<TemplatesLoadingShell />);

    expect(screen.getByRole("heading", { name: "読み込み中..." })).toBeInTheDocument();
    expect(screen.getByText("テンプレート管理を読み込んでいます。")).toBeInTheDocument();
    expect(screen.getByText("SOURCE EVENTS")).toBeInTheDocument();
    expect(screen.getByText("SAVED TEMPLATES")).toBeInTheDocument();
  });
});
