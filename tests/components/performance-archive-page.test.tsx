import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PerformanceArchivePageContent } from "@/components/performance-archive-page-content";

const {
  mockGetAuthSessionWithPlan,
  mockListEventSummaries,
  mockCreateDraftEventFormAction,
  mockDeleteEventFormAction,
  mockDuplicateEventFormAction,
  mockUpdateEventItemAction,
  mockRouterPush,
  mockRouterRefresh,
} = vi.hoisted(() => ({
  mockGetAuthSessionWithPlan: vi.fn(),
  mockListEventSummaries: vi.fn(),
  mockCreateDraftEventFormAction: vi.fn(),
  mockDeleteEventFormAction: vi.fn(),
  mockDuplicateEventFormAction: vi.fn(),
  mockUpdateEventItemAction: vi.fn(),
  mockRouterPush: vi.fn(),
  mockRouterRefresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
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
  getEventForUser: vi.fn(),
}));

vi.mock("@/app/(app)/events/actions", () => ({
  addEventItemAction: vi.fn(),
  createDraftEventFormAction: mockCreateDraftEventFormAction,
  deleteEventFormAction: mockDeleteEventFormAction,
  deleteEventItemAction: vi.fn(),
  duplicateEventFormAction: mockDuplicateEventFormAction,
  reorderEventItemsAction: vi.fn(),
  updateEventItemAction: mockUpdateEventItemAction,
  updateEventMetadataAction: vi.fn(),
}));

vi.mock("@/app/(app)/templates/actions", () => ({
  saveTemplateFromEventFormAction: vi.fn(),
  saveTemplateFromEventAction: vi.fn(),
}));

import EventsPage from "../../app/(app)/events/page";

const baseTimestamp = new Date("2026-03-21T00:00:00.000Z");
const authenticatedUserIdentity = {
  displayName: "Archive Owner",
  email: "archive-owner@example.com",
};

function AuthenticatedPerformanceArchivePageContent(
  props: Omit<ComponentProps<typeof PerformanceArchivePageContent>, "userIdentity">,
) {
  return <PerformanceArchivePageContent {...props} userIdentity={authenticatedUserIdentity} />;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Performance archive page route wiring", () => {
  it(
    "renders an archive-first surface instead of the editor placeholder",
    async () => {
    mockGetAuthSessionWithPlan.mockResolvedValue({
      session: {
        user: {
          id: "user-1",
          name: authenticatedUserIdentity.displayName,
          email: authenticatedUserIdentity.email,
        },
      },
      currentPlan: {
        plan: "free",
      },
    });

    mockListEventSummaries.mockResolvedValue([
      {
        id: "event-nagoya-radhall",
        ownerUserId: "user-1",
        title: "2026.03.28 名古屋 RADHALL",
        venue: "RADHALL",
        theme: "dark",
        eventDate: new Date("2026-03-28T09:00:00.000Z"),
        notes: "本番用セットリスト",
        createdAt: baseTimestamp,
        updatedAt: baseTimestamp,
        itemCount: 8,
      },
      {
        id: "event-shibuya-quattro",
        ownerUserId: "user-1",
        title: "2026.03.20 渋谷 CLUB QUATTRO",
        venue: "CLUB QUATTRO",
        theme: "light",
        eventDate: new Date("2026-03-20T09:00:00.000Z"),
        notes: "複製元候補",
        createdAt: baseTimestamp,
        updatedAt: baseTimestamp,
        itemCount: 6,
      },
    ]);

    const result = await EventsPage({
      searchParams: Promise.resolve({
        theme: "dark",
      }),
    });

    render(result);

    const header = screen.getByRole("banner");
    const rail =
      screen.getAllByRole("complementary").find((candidate) =>
        within(candidate).queryByRole("navigation", { name: "アプリ全体ナビゲーション" }),
      ) ?? screen.getAllByRole("complementary")[0];
    const appNavigation = within(rail).getByRole("navigation", { name: "アプリ全体ナビゲーション" });
    expect(screen.getByRole("heading", { name: "公演アーカイブ" })).toBeInTheDocument();
    expect(within(header).getByRole("button", { name: "ユーザーメニューを開く" })).toBeInTheDocument();
    expect(within(header).queryByRole("navigation", { name: "アプリ全体ナビゲーション" })).not.toBeInTheDocument();
    expect(within(rail).getByRole("button", { name: "サイドバーを折りたたむ" })).toBeInTheDocument();
    expect(within(appNavigation).getByRole("link", { name: "アーカイブ" })).toHaveAttribute(
      "href",
      "/events",
    );
    expect(within(appNavigation).getByRole("link", { name: "テンプレート" })).toHaveAttribute(
      "href",
      "/templates",
    );
    expect(within(appNavigation).getByRole("link", { name: "請求" })).toHaveAttribute(
      "href",
      "/settings/billing",
    );
    expect(within(appNavigation).getByRole("link", { name: "マイページ" })).toHaveAttribute(
      "href",
      "/account",
    );
    expect(
      within(appNavigation).getByRole("link", { name: "アーカイブ", current: "page" }),
    ).toHaveAttribute("aria-current", "page");
    const railFooter = within(rail).getByRole("contentinfo");
    expect(within(railFooter).getByRole("button", { name: "ログアウト" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ライトテーマ" })).toHaveAttribute(
      "href",
      "/events?theme=light",
    );
    expect(screen.getByRole("link", { name: "ダークテーマ" })).toHaveAttribute(
      "href",
      "/events?theme=dark",
    );
    expect(screen.getByLabelText("Event Theme")).toBeInTheDocument();
    const archiveStatusSection = screen.getByText("ARCHIVE STATUS").closest("section");
    expect(archiveStatusSection).toBeTruthy();
    if (!archiveStatusSection) {
      throw new Error("expected archive status section");
    }
    expect(within(archiveStatusSection).getByText("2公演")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Theme" })).toBeInTheDocument();
    const archiveRows = screen.getAllByRole("row");
    expect(within(archiveRows[1]).getByText("Dark")).toBeInTheDocument();
    expect(within(archiveRows[2]).getByText("Light")).toBeInTheDocument();
    const editLinks = screen.getAllByRole("link", { name: "編集" });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute("href", "/events/event-nagoya-radhall?theme=dark");
    expect(editLinks[1]).toHaveAttribute("href", "/events/event-shibuya-quattro?theme=light");

    const duplicateButtons = screen.getAllByRole("button", { name: "複製" });
    expect(duplicateButtons).toHaveLength(2);
    const secondDuplicateForm = duplicateButtons[1].closest("form");
    expect(secondDuplicateForm).toBeTruthy();
    if (!secondDuplicateForm) {
      throw new Error("expected second duplicate form");
    }
    expect(within(secondDuplicateForm).getByDisplayValue("light")).toHaveAttribute("name", "theme");

    expect(screen.getAllByRole("button", { name: "削除" })).toHaveLength(2);
    expect(
      screen.queryByText("公演を作成してセットリスト編集を開始"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Upcoming & Recent")).not.toBeInTheDocument();
    },
    20_000,
  );
});

describe("Performance archive page content", () => {
  it("shows archive controls and archive-oriented empty state copy", () => {
    render(
      <AuthenticatedPerformanceArchivePageContent
        events={[]}
        currentTheme="dark"
        currentPlan="free"
      />,
    );

    expect(screen.getByPlaceholderText("ARCHIVE SEARCH...")).toBeEnabled();
    expect(screen.getByText("Date Range")).toBeInTheDocument();
    expect(screen.getByText("Venue")).toBeInTheDocument();
    expect(screen.getByText("Event Theme")).toBeInTheDocument();
    expect(screen.getAllByRole("combobox")).toHaveLength(3);
    screen.getAllByRole("combobox").forEach((control) => {
      expect(control).toBeEnabled();
    });
    expect(screen.getByRole("button", { name: "RESET FILTERS" })).toBeEnabled();
    expect(
      screen.getByText("検索で一覧を絞り込み、RESET FILTERS で元に戻せます。"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "アーカイブにはまだ保存済みの公演がありません" }),
    ).toBeInTheDocument();
    const noSavedEventsSection = screen.getByText(
      "アーカイブにはまだ保存済みの公演がありません",
    ).closest("section");
    expect(noSavedEventsSection).toBeTruthy();
    if (!noSavedEventsSection) {
      throw new Error("expected no saved events section");
    }
    expect(
      within(noSavedEventsSection).getByRole("heading", { name: "まだ保存済みの公演がない" }),
    ).toBeInTheDocument();
    expect(
      within(noSavedEventsSection).getByRole("button", { name: "新規公演作成" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("公演を作成してセットリスト編集を開始"),
    ).not.toBeInTheDocument();
  });

  it("filters archive rows by venue, event theme, and Tokyo date range", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-04T03:00:00.000Z"));

    render(
      <AuthenticatedPerformanceArchivePageContent
        events={[
          {
            id: "event-nagoya-radhall",
            ownerUserId: "user-1",
            title: "2026.03.28 名古屋 RADHALL",
            venue: "RADHALL",
            theme: "dark",
            eventDate: new Date("2026-03-28T09:00:00.000Z"),
            notes: "本番用セットリスト",
            createdAt: baseTimestamp,
            updatedAt: baseTimestamp,
            itemCount: 8,
          },
          {
            id: "event-shibuya-quattro",
            ownerUserId: "user-1",
            title: "2026.03.20 渋谷 CLUB QUATTRO",
            venue: "CLUB QUATTRO",
            theme: "light",
            eventDate: new Date("2026-03-20T09:00:00.000Z"),
            notes: "複製元候補",
            createdAt: baseTimestamp,
            updatedAt: baseTimestamp,
            itemCount: 6,
          },
          {
            id: "event-osaka-bayhall",
            ownerUserId: "user-1",
            title: "2026.01.15 大阪 BAYHALL",
            venue: "BAYHALL",
            theme: "dark",
            eventDate: new Date("2026-01-15T00:00:00.000Z"),
            notes: "年前半",
            createdAt: baseTimestamp,
            updatedAt: baseTimestamp,
            itemCount: 5,
          },
          {
            id: "event-previous-year",
            ownerUserId: "user-1",
            title: "2025.12.31 未設定公演",
            venue: null,
            theme: "light",
            eventDate: new Date("2025-12-31T14:59:59.000Z"),
            notes: "前年分",
            createdAt: baseTimestamp,
            updatedAt: baseTimestamp,
            itemCount: 3,
          },
        ]}
        currentTheme="dark"
        currentPlan="free"
      />,
    );

    const searchInput = screen.getByPlaceholderText("ARCHIVE SEARCH...");
    const archiveStatusSection = screen.getByText("ARCHIVE STATUS").closest("section");
    const systemMetaSection = screen.getByText("SYSTEM META").closest("div");

    expect(archiveStatusSection).toBeTruthy();
    expect(systemMetaSection).toBeTruthy();

    if (!archiveStatusSection || !systemMetaSection) {
      throw new Error("expected archive status and system meta sections");
    }

    const venueSelect = screen.getByLabelText("Venue");
    const eventThemeSelect = screen.getByLabelText("Event Theme");
    const dateRangeSelect = screen.getByLabelText("Date Range");

    expect(venueSelect).toBeEnabled();
    expect(eventThemeSelect).toBeEnabled();
    expect(dateRangeSelect).toBeEnabled();
    expect(screen.getByRole("option", { name: "RADHALL" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "BAYHALL" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "未設定" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "All Themes" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Last 30 Days" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Earlier This Year" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Previous Years" })).toBeInTheDocument();

    fireEvent.change(venueSelect, { target: { value: "RADHALL" } });

    expect(screen.getByText("2026.03.28 名古屋 RADHALL")).toBeInTheDocument();
    expect(screen.queryByText("2026.03.20 渋谷 CLUB QUATTRO")).not.toBeInTheDocument();
    expect(
      screen.getByText("保存済みの公演は4公演です。現在は検索結果として1件を表示しています。"),
    ).toBeInTheDocument();
    expect(within(archiveStatusSection).getByText("4公演")).toBeInTheDocument();
    expect(within(systemMetaSection).getByText("Total Shows")).toBeInTheDocument();
    expect(within(systemMetaSection).getByText("4公演")).toBeInTheDocument();
    expect(screen.getByText("1件表示")).toBeInTheDocument();
    expect(screen.getByText("OF 4公演")).toBeInTheDocument();

    fireEvent.change(venueSelect, { target: { value: "all-venues" } });
    fireEvent.change(eventThemeSelect, { target: { value: "dark" } });

    expect(screen.getByText("2026.03.28 名古屋 RADHALL")).toBeInTheDocument();
    expect(screen.getByText("2026.01.15 大阪 BAYHALL")).toBeInTheDocument();
    expect(screen.queryByText("2026.03.20 渋谷 CLUB QUATTRO")).not.toBeInTheDocument();
    expect(screen.queryByText("2025.12.31 未設定公演")).not.toBeInTheDocument();
    expect(screen.getByText("2件表示")).toBeInTheDocument();

    fireEvent.change(dateRangeSelect, { target: { value: "earlier-this-year" } });

    expect(screen.getByText("2026.01.15 大阪 BAYHALL")).toBeInTheDocument();
    expect(screen.queryByText("2026.03.28 名古屋 RADHALL")).not.toBeInTheDocument();
    expect(screen.queryByText("2026.03.20 渋谷 CLUB QUATTRO")).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "NOT-A-MATCH" } });

    expect(
      screen.getByRole("heading", { name: "検索結果に一致する公演がありません" }),
    ).toBeInTheDocument();
    const filteredNoResultsSection = screen
      .getByRole("heading", { name: "検索結果に一致する公演がありません" })
      .closest("section");
    expect(filteredNoResultsSection).toBeTruthy();
    if (!filteredNoResultsSection) {
      throw new Error("expected filtered no-results section");
    }
    expect(
      within(filteredNoResultsSection).getByRole("heading", { name: "条件に一致する公演がない" }),
    ).toBeInTheDocument();
    expect(
      within(filteredNoResultsSection).getByRole("button", { name: "フィルタをリセット" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "RESET FILTERS" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "RESET FILTERS" }));

    expect(searchInput).toHaveValue("");
    expect(venueSelect).toHaveValue("all-venues");
    expect(eventThemeSelect).toHaveValue("all-themes");
    expect(dateRangeSelect).toHaveValue("all-dates");
    expect(screen.getByText("2026.03.28 名古屋 RADHALL")).toBeInTheDocument();
    expect(screen.getByText("2026.03.20 渋谷 CLUB QUATTRO")).toBeInTheDocument();
    expect(screen.getByText("2026.01.15 大阪 BAYHALL")).toBeInTheDocument();
    expect(screen.getByText("2025.12.31 未設定公演")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  }, 20_000);

  it("matches previous years using Asia/Tokyo day boundaries", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-04T03:00:00.000Z"));

    render(
      <AuthenticatedPerformanceArchivePageContent
        events={[
          {
            id: "event-nagoya-radhall",
            ownerUserId: "user-1",
            title: "2026.03.28 名古屋 RADHALL",
            venue: "RADHALL",
            theme: "dark",
            eventDate: new Date("2026-03-28T09:00:00.000Z"),
            notes: "本番用セットリスト",
            createdAt: baseTimestamp,
            updatedAt: baseTimestamp,
            itemCount: 8,
          },
          {
            id: "event-jan",
            ownerUserId: "user-1",
            title: "2026.01.15 大阪 BAYHALL",
            venue: "BAYHALL",
            theme: "dark",
            eventDate: new Date("2026-01-15T00:00:00.000Z"),
            notes: "年前半",
            createdAt: baseTimestamp,
            updatedAt: baseTimestamp,
            itemCount: 5,
          },
          {
            id: "event-prev-year",
            ownerUserId: "user-1",
            title: "2025.12.31 前年公演",
            venue: "SAPPORO",
            theme: "light",
            eventDate: new Date("2025-12-31T14:59:59.000Z"),
            notes: "前年分",
            createdAt: baseTimestamp,
            updatedAt: baseTimestamp,
            itemCount: 3,
          },
        ]}
        currentTheme="dark"
        currentPlan="free"
      />,
    );

    const dateRangeSelect = screen.getByLabelText("Date Range");
    fireEvent.change(dateRangeSelect, { target: { value: "previous-years" } });

    expect(screen.getByText("2025.12.31 前年公演")).toBeInTheDocument();
    expect(screen.queryByText("2026.01.15 大阪 BAYHALL")).not.toBeInTheDocument();
    expect(screen.queryByText("2026.03.28 名古屋 RADHALL")).not.toBeInTheDocument();
  });
});
