import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  pushMock,
  refreshMock,
  signInEmailMock,
  signUpEmailMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  signInEmailMock: vi.fn(),
  signUpEmailMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: signInEmailMock,
    },
    signUp: {
      email: signUpEmailMock,
    },
  },
}));

import { AuthForm } from "../../components/auth-form";

describe("AuthForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    signInEmailMock.mockReset();
    signUpEmailMock.mockReset();
  });

  it("submits the login flow in Japanese and routes to the app", async () => {
    signInEmailMock.mockResolvedValue({ error: null });

    render(<AuthForm mode="login" />);

    expect(screen.getByText("OPERATOR PANEL")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ログイン" })).toBeInTheDocument();
    expect(screen.queryByLabelText("名前")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "アカウントを作成" })).toHaveAttribute(
      "href",
      "/register",
    );

    fireEvent.change(screen.getByLabelText("メールアドレス"), {
      target: { value: "login@example.com" },
    });
    fireEvent.change(screen.getByLabelText("パスワード"), {
      target: { value: "password1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() =>
      expect(signInEmailMock).toHaveBeenCalledWith({
        email: "login@example.com",
        password: "password1234",
        callbackURL: "/events",
      }),
    );
    expect(pushMock).toHaveBeenCalledWith("/events");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("submits the register flow in Japanese and routes to the app", async () => {
    signUpEmailMock.mockResolvedValue({ error: null });

    render(<AuthForm mode="register" />);

    expect(screen.getByText("OPERATOR PANEL")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "アカウントを作成" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ログイン" })).toHaveAttribute("href", "/login");

    fireEvent.change(screen.getByLabelText("名前"), {
      target: { value: "Setlist Staff" },
    });
    fireEvent.change(screen.getByLabelText("メールアドレス"), {
      target: { value: "register@example.com" },
    });
    fireEvent.change(screen.getByLabelText("パスワード"), {
      target: { value: "password1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: "アカウントを作成" }));

    await waitFor(() =>
      expect(signUpEmailMock).toHaveBeenCalledWith({
        email: "register@example.com",
        password: "password1234",
        name: "Setlist Staff",
        callbackURL: "/events",
      }),
    );
    expect(pushMock).toHaveBeenCalledWith("/events");
    expect(refreshMock).toHaveBeenCalled();
  });
});
