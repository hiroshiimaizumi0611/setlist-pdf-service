import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const {
  mockGetAuthSessionWithPlan,
  mockListEventSummaries,
  mockGetEventForUser,
  mockCreateDraftEventFormAction,
  mockDeleteEventFormAction,
  mockUpdateEventItemAction,
} = vi.hoisted(() => ({
  mockGetAuthSessionWithPlan: vi.fn(),
  mockListEventSummaries: vi.fn(),
  mockGetEventForUser: vi.fn(),
  mockCreateDraftEventFormAction: vi.fn(),
  mockDeleteEventFormAction: vi.fn(),
  mockUpdateEventItemAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  })),
}));

vi.mock("@/lib/subscription", () => ({
  getAuthSessionWithPlan: mockGetAuthSessionWithPlan,
}));

vi.mock("@/lib/services/events-service", () => ({
  listEventSummaries: mockListEventSummaries,
  getEventForUser: mockGetEventForUser,
}));

vi.mock("@/app/(app)/events/actions", () => ({
  addEventItemAction: vi.fn(),
  createDraftEventFormAction: mockCreateDraftEventFormAction,
  deleteEventFormAction: mockDeleteEventFormAction,
  deleteEventItemAction: vi.fn(),
  duplicateEventFormAction: vi.fn(),
  reorderEventItemsAction: vi.fn(),
  updateEventItemAction: mockUpdateEventItemAction,
  updateEventMetadataAction: vi.fn(),
}));

vi.mock("@/app/(app)/templates/actions", () => ({
  saveTemplateFromEventFormAction: vi.fn(),
  saveTemplateFromEventAction: vi.fn(),
}));

import EventEditorPage from "../../app/(app)/events/[eventId]/page";

const baseTimestamp = new Date("2026-03-21T00:00:00.000Z");
const authenticatedUser = {
  id: "user-1",
  name: "Akari Setlist",
  email: "akari@example.com",
};

describe("EventEditorPage route wiring", () => {
  it("maps deleteItem search params into pendingDeleteItemId", async () => {
    mockGetAuthSessionWithPlan.mockResolvedValue({
      session: {
        user: authenticatedUser,
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
        eventDate: new Date("2026-03-28T09:00:00.000Z"),
        notes: "本番用セットリスト",
        createdAt: baseTimestamp,
        updatedAt: baseTimestamp,
        itemCount: 8,
      },
    ]);

    mockGetEventForUser.mockResolvedValue({
      id: "event-nagoya-radhall",
      ownerUserId: "user-1",
      title: "2026.03.28 名古屋 RADHALL",
      venue: "RADHALL",
      eventDate: new Date("2026-03-28T09:00:00.000Z"),
      notes: "本番用セットリスト",
      createdAt: baseTimestamp,
      updatedAt: baseTimestamp,
      items: [],
    });

    const result = await EventEditorPage({
      params: Promise.resolve({ eventId: "event-nagoya-radhall" }),
      searchParams: Promise.resolve({
        theme: "dark",
        deleteItem: "item-2",
      }),
    });

    expect(result.props.currentTheme).toBe("dark");
    expect(result.props.pendingDeleteItemId).toBe("item-2");
    expect(result.props.updateItemAction).toBe(mockUpdateEventItemAction);
  });

  it("keeps delete event handling wired without route-level modal state", async () => {
    mockGetAuthSessionWithPlan.mockResolvedValue({
      session: { user: authenticatedUser },
      currentPlan: { plan: "free" },
    });
    mockListEventSummaries.mockResolvedValue([
      {
        id: "event-nagoya-radhall",
        ownerUserId: "user-1",
        title: "2026.03.28 名古屋 RADHALL",
        venue: "RADHALL",
        eventDate: new Date("2026-03-28T09:00:00.000Z"),
        notes: "本番用セットリスト",
        createdAt: baseTimestamp,
        updatedAt: baseTimestamp,
        itemCount: 8,
      },
    ]);
    mockGetEventForUser.mockResolvedValue({
      id: "event-nagoya-radhall",
      ownerUserId: "user-1",
      title: "2026.03.28 名古屋 RADHALL",
      venue: "RADHALL",
      eventDate: new Date("2026-03-28T09:00:00.000Z"),
      notes: "本番用セットリスト",
      createdAt: baseTimestamp,
      updatedAt: baseTimestamp,
      items: [],
    });

    const result = await EventEditorPage({
      params: Promise.resolve({ eventId: "event-nagoya-radhall" }),
      searchParams: Promise.resolve({
        theme: "dark",
      }),
    });

    expect(result.props.deleteEventAction).toBe(mockDeleteEventFormAction);
    expect(result.props.createEventAction).toBe(mockCreateDraftEventFormAction);
  });

  it("does not expose editItem search params once editing is modal-driven", async () => {
    mockGetAuthSessionWithPlan.mockResolvedValue({
      session: {
        user: authenticatedUser,
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
        eventDate: new Date("2026-03-28T09:00:00.000Z"),
        notes: "本番用セットリスト",
        createdAt: baseTimestamp,
        updatedAt: baseTimestamp,
        itemCount: 8,
      },
    ]);

    mockGetEventForUser.mockResolvedValue({
      id: "event-nagoya-radhall",
      ownerUserId: "user-1",
      title: "2026.03.28 名古屋 RADHALL",
      venue: "RADHALL",
      eventDate: new Date("2026-03-28T09:00:00.000Z"),
      notes: "本番用セットリスト",
      createdAt: baseTimestamp,
      updatedAt: baseTimestamp,
      items: [],
    });

    const result = await EventEditorPage({
      params: Promise.resolve({ eventId: "event-nagoya-radhall" }),
      searchParams: Promise.resolve({
        theme: "light",
        editItem: "item-9",
      }),
    });

    expect(result.props.currentTheme).toBe("light");
    expect(result.props.editingItemId).toBeUndefined();
  });

  it(
    "keeps the dark shell composition connected at the route level",
    async () => {
    mockGetAuthSessionWithPlan.mockResolvedValue({
      session: {
        user: authenticatedUser,
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
        eventDate: new Date("2026-03-20T09:00:00.000Z"),
        notes: "複製元候補",
        createdAt: baseTimestamp,
        updatedAt: baseTimestamp,
        itemCount: 6,
      },
    ]);

    mockGetEventForUser.mockResolvedValue({
      id: "event-nagoya-radhall",
      ownerUserId: "user-1",
      title: "2026.03.28 名古屋 RADHALL",
      venue: "RADHALL",
      eventDate: new Date("2026-03-28T09:00:00.000Z"),
      notes: "本番用セットリスト",
      createdAt: baseTimestamp,
      updatedAt: baseTimestamp,
      items: [],
    });

    const result = await EventEditorPage({
      params: Promise.resolve({ eventId: "event-nagoya-radhall" }),
      searchParams: Promise.resolve({
        theme: "dark",
      }),
    });

    render(result);

    expect(screen.getByText("SHOWRUNNER")).toBeInTheDocument();
    expect(screen.getByText(/CURRENT SHOW:/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "セットリスト" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("banner")).queryByRole("navigation", {
        name: "アプリ全体ナビゲーション",
      }),
    ).not.toBeInTheDocument();

    const rail = screen.getByRole("complementary");
    expect(within(rail).getByRole("button", { name: "サイドバーを折りたたむ" })).toBeInTheDocument();
    const appNavigation = within(rail).getByRole("navigation", {
      name: "アプリ全体ナビゲーション",
    });
    expect(within(appNavigation).getByRole("link", { name: "アーカイブ", current: "page" })).toHaveAttribute(
      "aria-current",
      "page",
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
    expect(within(rail).getByRole("button", { name: "ログアウト" })).toBeInTheDocument();

    const navigation = within(rail).getByRole("navigation", {
      name: "公演ナビゲーション",
    });
    const currentEventLink = within(navigation).getByRole("link", { current: "page" });
    const currentEventCard = currentEventLink.closest("article");
    expect(currentEventCard).toBeTruthy();
    if (!currentEventCard) {
      throw new Error("expected current event card");
    }
    expect(currentEventCard).toHaveClass("bg-[#3a3a3a]");
    expect(currentEventCard).toHaveClass("text-[#f6c453]");
    },
    20_000,
  );
});
