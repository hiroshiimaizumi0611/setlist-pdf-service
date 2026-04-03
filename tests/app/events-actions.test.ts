import { describe, expect, it, vi } from "vitest";

const {
  mockGetSession,
  mockHeaders,
  mockCreateEvent,
  mockUpdateEventMetadata,
  mockRedirect,
  mockRevalidatePath,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockHeaders: vi.fn(),
  mockCreateEvent: vi.fn(),
  mockUpdateEventMetadata: vi.fn(),
  mockRedirect: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

vi.mock("next/headers", () => ({
  headers: mockHeaders,
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

vi.mock("@/lib/services/events-service", () => ({
  addEventItem: vi.fn(),
  createEvent: mockCreateEvent,
  deleteEvent: vi.fn(),
  deleteEventItem: vi.fn(),
  duplicateEvent: vi.fn(),
  reorderEventItems: vi.fn(),
  updateEventItem: vi.fn(),
  updateEventMetadata: mockUpdateEventMetadata,
}));

import {
  createDraftEventFormAction,
  updateEventMetadataAction,
} from "../../app/(app)/events/actions";

describe("event actions", () => {
  it("passes the submitted theme to draft event creation", async () => {
    mockHeaders.mockResolvedValue(new Headers());
    mockGetSession.mockResolvedValue({
      user: {
        id: "user-1",
      },
    });
    mockCreateEvent.mockResolvedValue({
      id: "event-1",
    });

    const formData = new FormData();
    formData.set("theme", "light");

    await createDraftEventFormAction(formData);

    expect(mockCreateEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        theme: "light",
      }),
    );
    expect(mockRedirect).toHaveBeenCalledWith("/events/event-1?theme=light");
  });

  it("passes the submitted theme through metadata updates", async () => {
    mockHeaders.mockResolvedValue(new Headers());
    mockGetSession.mockResolvedValue({
      user: {
        id: "user-1",
      },
    });
    mockUpdateEventMetadata.mockResolvedValue({
      id: "event-1",
    });

    await updateEventMetadataAction({
      eventId: "event-1",
      title: "2026.03.28 名古屋 RADHALL",
      venue: "RADHALL",
      eventDate: new Date("2026-03-28T09:00:00.000Z"),
      notes: "本番用セットリスト",
      theme: "light",
    });

    expect(mockUpdateEventMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        eventId: "event-1",
        theme: "light",
      }),
    );
  });
});
