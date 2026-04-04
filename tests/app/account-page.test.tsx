import { render, screen } from "@testing-library/react";
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
    const navigation = screen.getByRole("navigation", { name: "設定ナビゲーション" });
    expect(within(navigation).getByRole("link", { name: "アーカイブ" })).toHaveAttribute(
      "href",
      "/events",
    );
    expect(within(navigation).getByRole("link", { name: "テンプレート" })).toHaveAttribute(
      "href",
      "/templates",
    );
    expect(within(navigation).getByRole("link", { name: "請求" })).toHaveAttribute(
      "href",
      "/settings/billing",
    );
    expect(screen.getByText("Account Owner")).toBeInTheDocument();
    expect(screen.getByText("owner@example.com")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Account Summary")).toBeInTheDocument();
    expect(screen.getByText("Settings / Account")).toBeInTheDocument();
    expect(within(screen.getByRole("banner")).getByRole("button", { name: "ユーザーメニューを開く" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "プラン管理へ" }),
    ).toHaveAttribute("href", "/settings/billing");
  });

  it("short-circuits guests with a login redirect", async () => {
    mockGetAuthSessionWithPlan.mockResolvedValue(null);

    await expect(AccountPage()).rejects.toThrow(redirectError);

    expect(redirectMock).toHaveBeenCalledWith("/login");
    expect(mockGetAuthSessionWithPlan).toHaveBeenCalledTimes(1);
  });
});
