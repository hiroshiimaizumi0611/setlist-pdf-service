import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PerformanceArchivePageContent } from "@/components/performance-archive-page-content";

const {
  mockGetAuthSessionWithPlan,
  mockListEventSummaries,
  mockCreateDraftEventFormAction,
  mockDeleteEventFormAction,
  mockDuplicateEventFormAction,
  mockUpdateEventItemAction,
} = vi.hoisted(() => ({
  mockGetAuthSessionWithPlan: vi.fn(),
  mockListEventSummaries: vi.fn(),
  mockCreateDraftEventFormAction: vi.fn(),
  mockDeleteEventFormAction: vi.fn(),
  mockDuplicateEventFormAction: vi.fn(),
  mockUpdateEventItemAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
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

describe("Performance archive page route wiring", () => {
  it("renders an archive-first surface instead of the editor placeholder", async () => {
    mockGetAuthSessionWithPlan.mockResolvedValue({
      session: {
        user: {
          id: "user-1",
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

    expect(screen.getByRole("heading", { name: "公演アーカイブ" })).toBeInTheDocument();
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
  });
});

describe("Performance archive page content", () => {
  it("shows archive controls as pending and archive-oriented empty state copy", () => {
    render(
      <PerformanceArchivePageContent
        events={[]}
        currentTheme="dark"
        currentPlan="free"
      />,
    );

    expect(screen.getByPlaceholderText("ARCHIVE SEARCH...")).toBeDisabled();
    expect(screen.getByText("Date Range")).toBeInTheDocument();
    expect(screen.getByText("Venue")).toBeInTheDocument();
    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(screen.getAllByRole("combobox")).toHaveLength(3);
    screen.getAllByRole("combobox").forEach((control) => {
      expect(control).toBeDisabled();
    });
    expect(screen.getByRole("button", { name: "RESET FILTERS" })).toBeDisabled();
    expect(screen.getByText("検索とフィルタは準備中です。")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "アーカイブにはまだ保存済みの公演がありません" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("公演を作成してセットリスト編集を開始"),
    ).not.toBeInTheDocument();
  });
});
