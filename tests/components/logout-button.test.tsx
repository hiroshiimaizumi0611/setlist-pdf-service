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

import { LogoutButton } from "../../components/logout-button";

describe("LogoutButton", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    signOutMock.mockReset();
  });

  it("calls authClient.signOut and routes to /login", async () => {
    signOutMock.mockResolvedValue({ error: null });

    render(<LogoutButton />);

    fireEvent.click(screen.getByRole("button", { name: "ログアウト" }));

    await waitFor(() => expect(signOutMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login"));
    expect(refreshMock).toHaveBeenCalled();
  });

  it("shows a pending state while signing out", async () => {
    let resolveSignOut: ((value: { error: null }) => void) | undefined;
    signOutMock.mockImplementation(
      () =>
        new Promise<{ error: null }>((resolve) => {
          resolveSignOut = resolve;
        }),
    );

    render(<LogoutButton />);

    fireEvent.click(screen.getByRole("button", { name: "ログアウト" }));

    expect(screen.getByRole("button", { name: "ログアウト中..." })).toBeDisabled();

    resolveSignOut?.({ error: null });

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login"));
  });

  it("appends custom classes without dropping base disabled affordances", () => {
    render(<LogoutButton className="w-full justify-start rounded-2xl border-0" />);

    const button = screen.getByRole("button", { name: "ログアウト" });

    expect(button.className).toContain("inline-flex");
    expect(button.className).toContain("disabled:opacity-70");
    expect(button.className).toContain("w-full");
    expect(button.className).toContain("justify-start");
  });
});
