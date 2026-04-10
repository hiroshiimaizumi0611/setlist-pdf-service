import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { useFormStatusMock } = vi.hoisted(() => ({
  useFormStatusMock: vi.fn(),
}));

vi.mock("react-dom", async () => {
  const actual = await vi.importActual<typeof import("react-dom")>("react-dom");

  return {
    ...actual,
    useFormStatus: useFormStatusMock,
  };
});

import { FormPendingButton } from "../../components/form-pending-button";

describe("FormPendingButton", () => {
  it("shimmers the pending label without changing the button shell", () => {
    useFormStatusMock.mockReturnValue({ pending: true });

    render(
      <form>
        <FormPendingButton idleLabel="作成" pendingLabel="作成中..." className="w-full" />
      </form>,
    );

    const button = screen.getByRole("button", { name: "作成中..." });

    expect(button).toBeDisabled();
    expect(button).toHaveClass("w-full");
    expect(screen.getByText("作成中...")).toBeInTheDocument();
  });

  it("passes a dark-surface-safe shimmer tone to pending labels when requested", () => {
    useFormStatusMock.mockReturnValue({ pending: true });

    render(
      <form>
        <FormPendingButton
          idleLabel="作成"
          pendingLabel="作成中..."
          className="w-full"
          tone="dark"
        />
      </form>,
    );

    const shimmer = screen.getByText("作成中...");

    expect(shimmer.className).toContain(
      "motion-safe:bg-[linear-gradient(90deg,#3f3310_0%,#f6c453_50%,#3f3310_100%)]",
    );
  });
});
