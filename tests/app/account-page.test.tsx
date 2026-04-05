import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetAuthSessionWithPlan, redirectMock, redirectError } = vi.hoisted(() => ({
  mockGetAuthSessionWithPlan: vi.fn(),
  redirectMock: vi.fn(),
  redirectError: new Error("NEXT_REDIRECT"),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/subscription", () => ({
  getAuthSessionWithPlan: mockGetAuthSessionWithPlan,
}));

import AccountPage from "../../app/(app)/account/page";

describe("AccountPage", () => {
  beforeEach(() => {
    mockGetAuthSessionWithPlan.mockReset();
    redirectMock.mockReset();
    redirectMock.mockImplementation(() => {
      throw redirectError;
    });
  });

  it("renders the authenticated account summary with the free plan label and billing link", async () => {
    mockGetAuthSessionWithPlan.mockResolvedValue({
      session: {
        user: {
          id: "user-1",
          name: "Account Owner",
          email: "owner@example.com",
        },
      },
      currentPlan: {
        plan: "free",
      },
    });

    const page = await AccountPage();
    render(page);

    expect(
      screen.getByRole("heading", { name: "アカウント概要" }),
    ).toBeInTheDocument();
    const rail =
      screen.getAllByRole("complementary").find((candidate) =>
        within(candidate).queryByRole("navigation", { name: "アプリ全体ナビゲーション" }),
      ) ?? screen.getAllByRole("complementary")[0];
    const appNavigation = within(rail).getByRole("navigation", { name: "アプリ全体ナビゲーション" });
    expect(within(screen.getByRole("banner")).queryByRole("navigation", { name: "アプリ全体ナビゲーション" })).not.toBeInTheDocument();
    expect(within(rail).getByRole("button", { name: "サイドバーを縮小" })).toBeInTheDocument();
    expect(within(appNavigation).getByRole("link", { name: "アーカイブ" })).toHaveAttribute(
      "href",
      "/events",
    );
    expect(within(appNavigation).getByRole("link", { name: "テンプレート" })).toHaveAttribute(
      "href",
      "/templates",
    );
    expect(within(appNavigation).getByRole("link", { name: "請求" })).toHaveAttribute(
      "href",
      "/settings/billing",
    );
    expect(within(appNavigation).getByRole("link", { name: "マイページ", current: "page" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const railFooter = within(rail).getByRole("contentinfo");
    expect(within(railFooter).getByRole("button", { name: "ログアウト" })).toBeInTheDocument();
    expect(screen.getByText("Account Owner")).toBeInTheDocument();
    expect(screen.getByText("owner@example.com")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Account Summary")).toBeInTheDocument();
    expect(screen.getByText("Settings / Account")).toBeInTheDocument();
    expect(within(screen.getByRole("banner")).getByRole("button", { name: "ユーザーメニューを開く" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "プラン管理へ" }),
    ).toHaveAttribute("href", "/settings/billing");

    fireEvent.click(within(rail).getByRole("button", { name: "サイドバーを縮小" }));

    expect(within(rail).getByRole("button", { name: "サイドバーを展開" })).toBeInTheDocument();
    expect(within(appNavigation).getByRole("link", { name: "マイページ", current: "page" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(appNavigation).queryByText("アーカイブ")).not.toBeInTheDocument();
    expect(within(appNavigation).queryByText("テンプレート")).not.toBeInTheDocument();
    expect(within(appNavigation).queryByText("請求")).not.toBeInTheDocument();
    expect(within(appNavigation).queryByText("マイページ")).not.toBeInTheDocument();
  }, 20_000);

  it("short-circuits guests with a login redirect", async () => {
    mockGetAuthSessionWithPlan.mockResolvedValue(null);

    await expect(AccountPage()).rejects.toThrow(redirectError);

    expect(redirectMock).toHaveBeenCalledWith("/login");
    expect(mockGetAuthSessionWithPlan).toHaveBeenCalledTimes(1);
  });
});
