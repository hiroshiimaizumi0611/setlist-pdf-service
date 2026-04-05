import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", async () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

import { ExportPdfButton } from "../../components/export-pdf-button";

describe("ExportPdfButton", () => {
  it("keeps the CTA label on one line in dense headers", () => {
    render(<ExportPdfButton href="/api/events/event-1/pdf?theme=dark" currentTheme="dark" />);

    expect(screen.getByRole("button", { name: "PDF出力" }).className).toContain("whitespace-nowrap");
  });
});
