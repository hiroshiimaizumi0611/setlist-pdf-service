import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetAuthSessionWithPlan, redirectMock } = vi.hoisted(() => ({
  mockGetAuthSessionWithPlan: vi.fn(),
  redirectMock: vi.fn(),
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
  });

  it("renders the authenticated account summary with a billing link", async () => {
    mockGetAuthSessionWithPlan.mockResolvedValue({
      session: {
        user: {
          id: "user-1",
          name: "Account Owner",
          email: "owner@example.com",
        },
      },
      currentPlan: {
        plan: "pro",
      },
    });

    const page = await AccountPage();
    render(page);

    expect(
      screen.getByRole("heading", { name: "アカウント概要" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Account Owner")).toBeInTheDocument();
    expect(screen.getByText("owner@example.com")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "プラン管理へ" }),
    ).toHaveAttribute("href", "/settings/billing");
    expect(
      within(screen.getByRole("banner")).getByRole("button", {
        name: "ユーザーメニューを開く",
      }),
    ).toBeInTheDocument();
  });

  it("redirects guests to login", async () => {
    mockGetAuthSessionWithPlan.mockResolvedValue(null);

    await AccountPage();

    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});
