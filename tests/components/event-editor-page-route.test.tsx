import { describe, expect, it, vi } from "vitest";

const {
  mockGetAuthSessionWithPlan,
  mockListEventSummaries,
  mockGetEventForUser,
} = vi.hoisted(() => ({
  mockGetAuthSessionWithPlan: vi.fn(),
  mockListEventSummaries: vi.fn(),
  mockGetEventForUser: vi.fn(),
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
  getEventForUser: mockGetEventForUser,
}));

vi.mock("@/app/(app)/events/actions", () => ({
  addEventItemAction: vi.fn(),
  createEventAction: vi.fn(),
  deleteEventItemAction: vi.fn(),
  duplicateEventFormAction: vi.fn(),
  reorderEventItemsAction: vi.fn(),
  updateEventMetadataAction: vi.fn(),
}));

vi.mock("@/app/(app)/templates/actions", () => ({
  saveTemplateFromEventFormAction: vi.fn(),
  saveTemplateFromEventAction: vi.fn(),
}));

import EventEditorPage from "../../app/(app)/events/[eventId]/page";

const baseTimestamp = new Date("2026-03-21T00:00:00.000Z");

describe("EventEditorPage route wiring", () => {
  it("maps deleteItem search params into pendingDeleteItemId", async () => {
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
  });
});
