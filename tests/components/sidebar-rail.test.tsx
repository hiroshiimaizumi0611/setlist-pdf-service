import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SidebarRail } from "../../components/sidebar-rail";

describe("SidebarRail", () => {
  it("uses the tighter collapsed density for the rail chrome", () => {
    render(
      <SidebarRail
        currentTheme="dark"
        activeItem="archive"
        isAuthenticated={false}
        footer={null}
        pageContent={<div>page content</div>}
      />,
    );

    const rail = screen.getByRole("complementary");

    fireEvent.click(within(rail).getByRole("button", { name: "サイドバーを折りたたむ" }));

    expect(rail.className).toContain("lg:w-[5rem]");
    expect(screen.queryByText("Navigation")).not.toBeInTheDocument();

    const collapseButton = within(rail).getByRole("button", { name: "サイドバーを展開" });
    expect(collapseButton.className).toContain("h-9");
    expect(collapseButton.className).toContain("w-9");

    const brandLink = within(rail).getByRole("link", { name: /SETLIST PDF/ });
    const brandMark = brandLink.querySelector("span");
    expect(brandMark?.className).toContain("h-8");
    expect(brandMark?.className).toContain("w-8");

    const archiveLink = within(rail)
      .getByRole("navigation", { name: "アプリ全体ナビゲーション" })
      .querySelector('a[href="/events"]');
    expect(archiveLink?.className).toContain("justify-center");
    expect(archiveLink?.className).toContain("px-0");
  });
});
