import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("renders the avatar trigger and toggles identity and navigation content", () => {
    render(
      <UserMenu
        displayName="Akari Stage"
        email="akari@example.com"
        currentPlan="pro"
      />,
    );

    const trigger = screen.getByRole("button", { name: "ユーザーメニューを開く" });
    expect(trigger).toHaveTextContent("A");
    expect(screen.queryByText("akari@example.com")).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.getByText("Akari Stage")).toBeInTheDocument();
    expect(screen.getByText("akari@example.com")).toBeInTheDocument();
    expect(screen.getByText("pro")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "マイページ" })).toHaveAttribute("href", "/account");
    expect(screen.getByRole("link", { name: "プラン管理" })).toHaveAttribute(
      "href",
      "/settings/billing",
    );

    fireEvent.click(trigger);

    expect(screen.queryByText("Akari Stage")).not.toBeInTheDocument();
  });

  it("closes the menu on outside click and escape", () => {
    render(
      <div>
        <button type="button">outside</button>
        <UserMenu
          displayName="Akari Stage"
          email="akari@example.com"
          currentPlan="pro"
        />
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "ユーザーメニューを開く" }));
    expect(screen.getByText("Akari Stage")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole("button", { name: "outside" }));
    expect(screen.queryByText("Akari Stage")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ユーザーメニューを開く" }));
    expect(screen.getByText("Akari Stage")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Akari Stage")).not.toBeInTheDocument();
  });

  it("keeps the logout action wired to authClient.signOut and /login", async () => {
    signOutMock.mockResolvedValue({ error: null });

    render(
      <UserMenu
        displayName="Akari Stage"
        email="akari@example.com"
        currentPlan="pro"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "ユーザーメニューを開く" }));
    fireEvent.click(screen.getByRole("button", { name: "ログアウト" }));

    await waitFor(() => expect(signOutMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login"));
    expect(refreshMock).toHaveBeenCalled();
  });
});
