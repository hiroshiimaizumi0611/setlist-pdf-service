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

  it("keeps the logout footer outside the rail scroll region", () => {
    render(
      <SidebarRail
        currentTheme="dark"
        activeItem="billing"
        isAuthenticated={false}
        footer={<button type="button">footer action</button>}
        pageContent={
          <div>
            <div>settings panel</div>
            <div style={{ height: 1200 }}>tall content</div>
          </div>
        }
      />,
    );

    const rail = screen.getByRole("complementary");
    expect(rail.className).toContain("lg:overflow-hidden");

    const scrollRegion = rail.querySelector('[data-rail-scroll-region="true"]');
    expect(scrollRegion).toBeTruthy();
    expect(scrollRegion?.className).toContain("overflow-y-auto");

    const railFooter = within(rail).getByRole("contentinfo");
    expect(within(railFooter).getByRole("button", { name: "footer action" })).toBeInTheDocument();
    expect(scrollRegion).not.toContain(railFooter);
  });
});
