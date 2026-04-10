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

    const heading = screen.getByRole("heading", { name: "読み込み中..." });
    expect(heading).toHaveTextContent("読み込み中...");
    const shimmer = heading.querySelector("span");
    expect(shimmer).toBeInTheDocument();
    expect(shimmer?.className).toContain("motion-safe:");
    expect(screen.getByText("テンプレート管理を読み込んでいます。")).toBeInTheDocument();
    expect(screen.getByText("SOURCE EVENTS")).toBeInTheDocument();
    expect(screen.getByText("SAVED TEMPLATES")).toBeInTheDocument();
  });
});
