import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const {
  mockGetAuthSessionWithPlan,
  mockListEventSummaries,
  mockListTemplates,
  mockRouterPush,
  mockRouterRefresh,
} = vi.hoisted(() => ({
  mockGetAuthSessionWithPlan: vi.fn(),
  mockListEventSummaries: vi.fn(),
  mockListTemplates: vi.fn(),
  mockRouterPush: vi.fn(),
  mockRouterRefresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    refresh: mockRouterRefresh,
  }),
}));

vi.mock("@/lib/subscription", () => ({
  getAuthSessionWithPlan: mockGetAuthSessionWithPlan,
}));

vi.mock("@/lib/services/events-service", () => ({
  listEventSummaries: mockListEventSummaries,
}));

vi.mock("@/lib/services/templates-service", () => ({
  listTemplates: mockListTemplates,
}));

vi.mock("@/app/(app)/templates/actions", () => ({
  createEventFromTemplateFormAction: vi.fn(),
  saveTemplateFromEventAction: vi.fn(),
  saveTemplateFromEventFormAction: vi.fn(),
}));

import TemplatesPage from "../../app/(app)/templates/page";

describe("TemplatesPage", () => {
  it("lays out a two-part templates workspace", async () => {
    mockGetAuthSessionWithPlan.mockResolvedValue({
      session: {
        user: {
          id: "user-1",
          name: "Template Curator",
          email: "templates@example.com",
        },
      },
      currentPlan: {
        plan: "pro",
      },
    });

    mockListEventSummaries.mockResolvedValue([
      {
        id: "event-1",
        ownerUserId: "user-1",
        title: "2026.03.28 名古屋 RADHALL",
        venue: "RADHALL",
        eventDate: new Date("2026-03-28T09:00:00.000Z"),
        notes: "保存対象",
        createdAt: new Date("2026-03-21T00:00:00.000Z"),
        updatedAt: new Date("2026-03-21T00:00:00.000Z"),
        itemCount: 4,
      },
    ]);
    mockListTemplates.mockResolvedValue([
      {
        id: "template-1",
        ownerUserId: "user-1",
        name: "2026春ツアー用テンプレート",
        description: "静かな立ち上がりからアンコールまで",
        createdAt: new Date("2026-03-22T00:00:00.000Z"),
        updatedAt: new Date("2026-03-22T00:00:00.000Z"),
        items: [
          {
            id: "template-item-1",
            templateId: "template-1",
            position: 1,
            itemType: "song",
            title: "オープニング",
            artist: null,
            durationSeconds: 210,
            notes: "ゆっくり入る",
            createdAt: new Date("2026-03-22T00:00:00.000Z"),
            updatedAt: new Date("2026-03-22T00:00:00.000Z"),
          },
        ],
      },
    ]);

    const result = await TemplatesPage();
    render(result);

    const header = screen.getByRole("banner");
    const rail =
      screen.getAllByRole("complementary").find((candidate) =>
        within(candidate).queryByRole("navigation", { name: "アプリ全体ナビゲーション" }),
      ) ?? screen.getAllByRole("complementary")[0];
    const appNavigation = within(rail).getByRole("navigation", { name: "アプリ全体ナビゲーション" });
    expect(screen.getByText("テンプレート管理")).toBeInTheDocument();
    expect(screen.getByText("既存公演から保存")).toBeInTheDocument();
    expect(screen.getByText("保存済みテンプレート一覧")).toBeInTheDocument();
    expect(screen.getByText("保存済みテンプレート")).toBeInTheDocument();
    expect(screen.getByText("1 items")).toBeInTheDocument();
    expect(screen.getByText("静かな立ち上がりからアンコールまで")).toBeInTheDocument();
    expect(within(header).queryByRole("navigation", { name: "アプリ全体ナビゲーション" })).not.toBeInTheDocument();
    expect(within(rail).getByRole("button", { name: "サイドバーを折りたたむ" })).toBeInTheDocument();
    expect(within(appNavigation).getByRole("link", { name: "アーカイブ" })).toHaveAttribute(
      "href",
      "/events",
    );
    expect(within(appNavigation).getByRole("link", { name: "テンプレート", current: "page" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(appNavigation).getByRole("link", { name: "請求" })).toHaveAttribute(
      "href",
      "/settings/billing",
    );
    expect(within(appNavigation).getByRole("link", { name: "マイページ" })).toHaveAttribute(
      "href",
      "/account",
    );
    const railFooter = within(rail).getByRole("contentinfo");
    expect(within(railFooter).getByRole("button", { name: "ログアウト" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "この公演から保存" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "このテンプレートで公演作成" })).toBeInTheDocument();
    expect(within(header).getByRole("button", { name: "ユーザーメニューを開く" })).toBeInTheDocument();
  }, 20_000);

  it("shows a purposeful empty state for saved templates", async () => {
    mockGetAuthSessionWithPlan.mockResolvedValue({
      session: {
        user: {
          id: "user-1",
          name: "Template Curator",
          email: "templates@example.com",
        },
      },
      currentPlan: {
        plan: "pro",
      },
    });

    mockListEventSummaries.mockResolvedValue([]);
    mockListTemplates.mockResolvedValue([]);

    const result = await TemplatesPage();
    render(result);

    expect(screen.getByText("保存済みテンプレート")).toBeInTheDocument();
    expect(
      screen.getByText(
        "まだ保存済みテンプレートがありません。公演内容を保存すると、この一覧から次回公演をすぐ立ち上げられます。",
      ),
    ).toBeInTheDocument();
  });
});
