import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const authFormMock = vi.hoisted(() => vi.fn(({ mode }: { mode: "login" | "register" }) => mode));

vi.mock("@/components/auth-form", () => ({
  AuthForm: ({ mode }: { mode: "login" | "register" }) => (
    <div data-testid="auth-form">{authFormMock({ mode })}</div>
  ),
}));

import LoginPage from "../../app/(auth)/login/page";
import RegisterPage from "../../app/(auth)/register/page";

describe("auth pages", () => {
  it("/login renders the backstage auth shell", () => {
    render(<LoginPage />);

    expect(screen.getByText("SHOWRUNNER")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "現場のためのセットリスト作成。" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "LOGIN / BACKSTAGE" })).toBeInTheDocument();
    expect(screen.getByTestId("auth-form")).toHaveTextContent("login");
  });

  it("/register keeps the same shell family while switching mode", () => {
    render(<RegisterPage />);

    expect(screen.getByText("SHOWRUNNER")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "現場のためのセットリスト作成。" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("auth-form")).toHaveTextContent("register");
  });
});
