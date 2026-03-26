import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetAuthSession, redirectMock } = vi.hoisted(() => ({
  mockGetAuthSession: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

import HomePage from "../app/page";

describe("HomePage", () => {
  beforeEach(() => {
    mockGetAuthSession.mockReset();
    redirectMock.mockReset();
  });

  it("redirects signed-in visitors to the app", async () => {
    mockGetAuthSession.mockResolvedValue({
      user: {
        id: "user-1",
      },
    });

    await HomePage();

    expect(redirectMock).toHaveBeenCalledWith("/events");
  });

  it("renders the entrypoint for anonymous visitors", async () => {
    mockGetAuthSession.mockResolvedValue(null);

    const page = await HomePage();
    render(page);

    expect(
      screen.getByRole("heading", {
        name: "公演の流れを、PDFまでひとつにつなぐ。",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "アカウントを作成" })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.getByRole("link", { name: "ログイン" })).toHaveAttribute("href", "/login");
  });
});
