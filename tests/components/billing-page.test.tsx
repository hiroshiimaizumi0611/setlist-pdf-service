import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BillingPageContent } from "../../app/(app)/settings/billing/page";

const { mockRouterPush, mockRouterRefresh } = vi.hoisted(() => ({
  mockRouterPush: vi.fn(),
  mockRouterRefresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    refresh: mockRouterRefresh,
  }),
}));

const authenticatedViewerProps = {
  isAuthenticated: true as const,
  userIdentity: {
    displayName: "Billing User",
    email: "billing@example.com",
  },
};

describe("BillingPageContent", () => {
  it("renders the free plan state with an upgrade CTA", () => {
    render(
      <BillingPageContent
        currentPlan="free"
        {...authenticatedViewerProps}
        isStripeConfigured={false}
        subscription={null}
      />,
    );

    expect(screen.getByText("Subscription Management")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "設定ナビゲーション" })).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Billing")).toBeInTheDocument();
    expect(screen.getByText("Subscription")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Current Plan" })).toBeInTheDocument();
    expect(screen.getByText("プラン比較")).toBeInTheDocument();
    expect(screen.getByText("お支払い方法")).toBeInTheDocument();
    expect(screen.getByText("請求履歴")).toBeInTheDocument();
    expect(screen.getByText("請求履歴はまだありません")).toBeInTheDocument();

    expect(screen.getByText("プラン管理")).toBeInTheDocument();
    expect(screen.getByText("基本機能込み")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Proへアップグレード" })).toBeInTheDocument();
    expect(within(screen.getByRole("banner")).getByRole("button", { name: "ユーザーメニューを開く" })).toBeInTheDocument();
    expect(
      screen.getByText("Stripe test mode の設定が未完了でも画面確認できるようにしています。"),
    ).toBeInTheDocument();
  }, 20_000);

  it("renders the pro plan state with a billing portal CTA", () => {
    render(
      <BillingPageContent
        currentPlan="pro"
        {...authenticatedViewerProps}
        isStripeConfigured={true}
        subscription={{
          plan: "pro",
          status: "active",
          seats: 1,
          billingInterval: "month",
          periodEnd: new Date("2026-05-01T00:00:00.000Z"),
        }}
      />,
    );

    expect(
      screen.getByText("登録済みの支払い方法は Billing Portal から更新できます。"),
    ).toBeInTheDocument();
    expect(screen.getByText("有効中")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "支払い方法を確認" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "お支払い設定を開く" })).toBeInTheDocument();
    expect(within(screen.getByRole("banner")).getByRole("button", { name: "ユーザーメニューを開く" })).toBeInTheDocument();
  });

  it("renders a safe non-clicking billing state for seeded pro users without Stripe", () => {
    render(
      <BillingPageContent
        currentPlan="pro"
        {...authenticatedViewerProps}
        isStripeConfigured={false}
        subscription={{
          plan: "pro",
          status: "active",
          seats: 1,
          billingInterval: "month",
          periodEnd: new Date("2026-05-01T00:00:00.000Z"),
        }}
      />,
    );

    expect(screen.getByText("Stripe 未設定のため、お支払い方法は利用できません。")).toBeInTheDocument();
    expect(screen.getByText("有効中")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "支払い方法を確認" })).toBeDisabled();
    expect(within(screen.getByRole("banner")).getByRole("button", { name: "ユーザーメニューを開く" })).toBeInTheDocument();
    expect(
      screen.getByText("Stripe未設定のため、お支払い設定はご利用いただけません。"),
    ).toBeInTheDocument();
  });

  it("routes anonymous visitors to login instead of checkout", () => {
    render(
      <BillingPageContent
        currentPlan="free"
        isStripeConfigured={true}
        isAuthenticated={false}
        subscription={null}
      />,
    );

    expect(
      screen.getByRole("link", { name: "ログインしてアップグレード" }),
    ).toHaveAttribute("href", "/login");
    expect(
      within(screen.getByRole("banner")).getByRole("link", { name: "ログイン" }),
    ).toHaveAttribute("href", "/login");
    expect(
      within(screen.getByRole("banner")).queryByRole("button", { name: "ユーザーメニューを開く" }),
    ).not.toBeInTheDocument();
  });
});
