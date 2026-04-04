import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { pushMock, refreshMock, signOutMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  signOutMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signOut: signOutMock,
  },
}));

import { UserMenu } from "../../components/user-menu";

describe("UserMenu", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    signOutMock.mockReset();
  });

  it("opens to show identity details and account actions", () => {
    render(
      <UserMenu
        displayName="山田 太郎"
        email="taro@example.com"
        currentPlan="pro"
      />,
    );

    const trigger = screen.getByRole("button", { name: "ユーザーメニューを開く" });
    expect(trigger).toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.getByText("山田 太郎")).toBeInTheDocument();
    expect(screen.getByText("taro@example.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "マイページ" })).toHaveAttribute("href", "/account");
    expect(screen.getByRole("link", { name: "プラン管理" })).toHaveAttribute(
      "href",
      "/settings/billing",
    );
    expect(screen.getByRole("button", { name: "ログアウト" })).toBeInTheDocument();
  });

  it("closes after escape is pressed", () => {
    render(
      <UserMenu
        displayName="山田 太郎"
        email="taro@example.com"
        currentPlan="pro"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "ユーザーメニューを開く" }));
    expect(screen.getByText("山田 太郎")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByText("山田 太郎")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "マイページ" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ログアウト" })).not.toBeInTheDocument();
  });
});
