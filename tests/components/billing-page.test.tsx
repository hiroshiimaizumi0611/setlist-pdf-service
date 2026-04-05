import { fireEvent, render, screen, within } from "@testing-library/react";
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

    const banner = screen.getByRole("banner");
    const rail =
      screen.getAllByRole("complementary").find((candidate) =>
        within(candidate).queryByRole("navigation", { name: "アプリ全体ナビゲーション" }),
      ) ?? screen.getAllByRole("complementary")[0];
    const appNavigation = within(rail).getByRole("navigation", { name: "アプリ全体ナビゲーション" });
    expect(screen.getByRole("heading", { name: "Current Plan" })).toBeInTheDocument();
    expect(within(banner).queryByRole("navigation", { name: "アプリ全体ナビゲーション" })).not.toBeInTheDocument();
    expect(within(rail).getByRole("button", { name: "サイドバーを折りたたむ" })).toBeInTheDocument();
    expect(within(appNavigation).getByRole("link", { name: "アーカイブ" })).toHaveAttribute(
      "href",
      "/events",
    );
    expect(within(appNavigation).getByRole("link", { name: "テンプレート" })).toHaveAttribute(
      "href",
      "/templates",
    );
    expect(within(appNavigation).getByRole("link", { name: "請求", current: "page" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(appNavigation).getByRole("link", { name: "マイページ" })).toHaveAttribute(
      "href",
      "/account",
    );
    const settingsNavigation = within(rail).getByRole("navigation", { name: "設定ナビゲーション" });
    expect(settingsNavigation).toBeInTheDocument();
    const railFooter = within(rail).getByRole("contentinfo");
    expect(within(railFooter).getByRole("button", { name: "ログアウト" })).toBeInTheDocument();
    expect(within(appNavigation).getByRole("link", { name: "請求" })).toHaveAttribute(
      "href",
      "/settings/billing",
    );
    expect(screen.getByRole("heading", { name: "Current Plan" })).toBeInTheDocument();
    expect(screen.getByText("プラン比較")).toBeInTheDocument();
    expect(screen.getByText("お支払い方法")).toBeInTheDocument();
    expect(screen.getByText("請求履歴")).toBeInTheDocument();
    expect(screen.getByText("請求履歴はまだありません")).toBeInTheDocument();

    expect(screen.getByText("請求サマリー")).toBeInTheDocument();
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

    const banner = screen.getByRole("banner");
    expect(
      screen.getByText("登録済みの支払い方法は Billing Portal から更新できます。"),
    ).toBeInTheDocument();
    const rail =
      screen.getAllByRole("complementary").find((candidate) =>
        within(candidate).queryByRole("navigation", { name: "アプリ全体ナビゲーション" }),
      ) ?? screen.getAllByRole("complementary")[0];
    const appNavigation = within(rail).getByRole("navigation", { name: "アプリ全体ナビゲーション" });
    expect(within(banner).queryByRole("navigation", { name: "アプリ全体ナビゲーション" })).not.toBeInTheDocument();
    expect(within(rail).getByRole("button", { name: "サイドバーを折りたたむ" })).toBeInTheDocument();
    expect(within(appNavigation).getByRole("link", { name: "アーカイブ" })).toHaveAttribute(
      "href",
      "/events",
    );
    expect(within(appNavigation).getByRole("link", { name: "テンプレート" })).toHaveAttribute(
      "href",
      "/templates",
    );
    expect(within(appNavigation).getByRole("link", { name: "請求", current: "page" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(appNavigation).getByRole("link", { name: "マイページ" })).toHaveAttribute(
      "href",
      "/account",
    );
    expect(within(rail).getByRole("navigation", { name: "設定ナビゲーション" })).toBeInTheDocument();
    const railFooter = within(rail).getByRole("contentinfo");
    expect(within(railFooter).getByRole("button", { name: "ログアウト" })).toBeInTheDocument();
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

    const banner = screen.getByRole("banner");
    expect(screen.getByText("Stripe 未設定のため、お支払い方法は利用できません。")).toBeInTheDocument();
    const rail =
      screen.getAllByRole("complementary").find((candidate) =>
        within(candidate).queryByRole("navigation", { name: "アプリ全体ナビゲーション" }),
      ) ?? screen.getAllByRole("complementary")[0];
    const appNavigation = within(rail).getByRole("navigation", { name: "アプリ全体ナビゲーション" });
    expect(within(banner).queryByRole("navigation", { name: "アプリ全体ナビゲーション" })).not.toBeInTheDocument();
    expect(within(rail).getByRole("button", { name: "サイドバーを折りたたむ" })).toBeInTheDocument();
    expect(within(appNavigation).getByRole("link", { name: "アーカイブ" })).toHaveAttribute(
      "href",
      "/events",
    );
    expect(within(appNavigation).getByRole("link", { name: "テンプレート" })).toHaveAttribute(
      "href",
      "/templates",
    );
    expect(within(appNavigation).getByRole("link", { name: "請求", current: "page" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(appNavigation).getByRole("link", { name: "マイページ" })).toHaveAttribute(
      "href",
      "/account",
    );
    expect(within(rail).getByRole("navigation", { name: "設定ナビゲーション" })).toBeInTheDocument();
    const railFooter = within(rail).getByRole("contentinfo");
    expect(within(railFooter).getByRole("button", { name: "ログアウト" })).toBeInTheDocument();
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
    const rail =
      screen.getAllByRole("complementary").find((candidate) =>
        within(candidate).queryByRole("navigation", { name: "アプリ全体ナビゲーション" }),
      ) ?? screen.getAllByRole("complementary")[0];
    const appNavigation = within(rail).getByRole("navigation", { name: "アプリ全体ナビゲーション" });
    expect(within(appNavigation).getByRole("link", { name: "請求", current: "page" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(appNavigation).getByRole("link", { name: "アーカイブ" })).toHaveAttribute(
      "href",
      "/events",
    );
    expect(within(appNavigation).getByRole("link", { name: "テンプレート" })).toHaveAttribute(
      "href",
      "/templates",
    );
    expect(within(appNavigation).getByRole("link", { name: "マイページ" })).toHaveAttribute(
      "href",
      "/account",
    );
    expect(within(rail).getByRole("navigation", { name: "設定ナビゲーション" })).toBeInTheDocument();
    expect(within(rail).queryByRole("contentinfo")).not.toBeInTheDocument();
    expect(within(rail).queryByRole("button", { name: "ログアウト" })).not.toBeInTheDocument();
    expect(within(screen.getByRole("banner")).queryByRole("button", { name: "ユーザーメニューを開く" })).not.toBeInTheDocument();
  });

  it("collapses to icon-only app nav while compacting the settings sidebar", () => {
    render(
      <BillingPageContent
        currentPlan="free"
        {...authenticatedViewerProps}
        isStripeConfigured={false}
        subscription={null}
      />,
    );

    const rail =
      screen.getAllByRole("complementary").find((candidate) =>
        within(candidate).queryByRole("navigation", { name: "アプリ全体ナビゲーション" }),
      ) ?? screen.getAllByRole("complementary")[0];
    const appNavigation = within(rail).getByRole("navigation", { name: "アプリ全体ナビゲーション" });

    fireEvent.click(within(rail).getByRole("button", { name: "サイドバーを折りたたむ" }));

    expect(within(rail).getByRole("button", { name: "サイドバーを展開" })).toBeInTheDocument();
    expect(within(appNavigation).getByRole("link", { name: "請求", current: "page" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(rail).queryByRole("navigation", { name: "設定ナビゲーション" })).not.toBeInTheDocument();
  });
});
