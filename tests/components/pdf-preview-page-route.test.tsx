import { describe, expect, it, vi, beforeEach } from "vitest";
import { oWestEvent } from "../fixtures/o-west-event";

const mocks = vi.hoisted(() => ({
  mockGetAuthSessionWithPlan: vi.fn(),
  mockGetEventForUser: vi.fn(),
  mockBuildSetlistPdfLayout: vi.fn(),
  mockRedirect: vi.fn(),
  mockNotFound: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.mockRedirect,
  notFound: mocks.mockNotFound,
}));

vi.mock("@/lib/subscription", () => ({
  getAuthSessionWithPlan: mocks.mockGetAuthSessionWithPlan,
}));

vi.mock("@/lib/services/events-service", () => ({
  getEventForUser: mocks.mockGetEventForUser,
}));

vi.mock("@/lib/pdf/build-layout", () => ({
  buildSetlistPdfLayout: mocks.mockBuildSetlistPdfLayout,
}));

import PdfPreviewPage from "../../app/(app)/events/[eventId]/pdf/page";

describe("EventPdfPreviewPage route wiring", () => {
  const mockLayout = {
    pageCount: 2,
    warnings: [],
    pages: [],
  };

  beforeEach(() => {
    mocks.mockGetAuthSessionWithPlan.mockReset();
    mocks.mockGetEventForUser.mockReset();
    mocks.mockBuildSetlistPdfLayout.mockReset();
    mocks.mockRedirect.mockReset();
    mocks.mockNotFound.mockReset();
  });

  it("passes the shared layout model to the preview shell for a dark preview request", async () => {
    mocks.mockGetAuthSessionWithPlan.mockResolvedValue({
      session: {
        user: {
          id: "user-1",
        },
      },
      currentPlan: {
        plan: "free",
      },
    });
    mocks.mockGetEventForUser.mockResolvedValue(oWestEvent);
    mocks.mockBuildSetlistPdfLayout.mockReturnValue(mockLayout);

    const result = await PdfPreviewPage({
      params: Promise.resolve({ eventId: oWestEvent.id }),
      searchParams: Promise.resolve({ theme: "dark" }),
    });

    expect(mocks.mockGetEventForUser).toHaveBeenCalledWith({
      userId: "user-1",
      eventId: oWestEvent.id,
    });
    expect(mocks.mockBuildSetlistPdfLayout).toHaveBeenCalledWith({
      event: oWestEvent,
      theme: "dark",
    });
    expect(result.props.currentTheme).toBe("dark");
    expect(result.props.event).toBe(oWestEvent);
    expect(result.props.layout).toBe(mockLayout);
    expect(result.props.downloadHref).toBe(
      `/api/events/${oWestEvent.id}/pdf?theme=dark`,
    );
  });

  it("falls back to light when theme query is invalid", async () => {
    mocks.mockGetAuthSessionWithPlan.mockResolvedValue({
      session: {
        user: {
          id: "user-1",
        },
      },
      currentPlan: {
        plan: "free",
      },
    });
    mocks.mockGetEventForUser.mockResolvedValue(oWestEvent);
    mocks.mockBuildSetlistPdfLayout.mockReturnValue(mockLayout);

    const result = await PdfPreviewPage({
      params: Promise.resolve({ eventId: oWestEvent.id }),
      searchParams: Promise.resolve({ theme: "sepia" }),
    });

    expect(mocks.mockBuildSetlistPdfLayout).toHaveBeenCalledWith({
      event: oWestEvent,
      theme: "light",
    });
    expect(result.props.currentTheme).toBe("light");
    expect(result.props.downloadHref).toBe(
      `/api/events/${oWestEvent.id}/pdf?theme=light`,
    );
  });

  it("redirects anonymous visitors to login", async () => {
    mocks.mockGetAuthSessionWithPlan.mockResolvedValue(null);

    await PdfPreviewPage({
      params: Promise.resolve({ eventId: oWestEvent.id }),
      searchParams: Promise.resolve({ theme: "dark" }),
    });

    expect(mocks.mockRedirect).toHaveBeenCalledWith("/login");
    expect(mocks.mockGetEventForUser).not.toHaveBeenCalled();
    expect(mocks.mockBuildSetlistPdfLayout).not.toHaveBeenCalled();
  });

  it("returns notFound when the event cannot be loaded", async () => {
    mocks.mockGetAuthSessionWithPlan.mockResolvedValue({
      session: {
        user: {
          id: "user-1",
        },
      },
      currentPlan: {
        plan: "free",
      },
    });
    mocks.mockGetEventForUser.mockRejectedValue(new Error("Event not found."));

    await PdfPreviewPage({
      params: Promise.resolve({ eventId: oWestEvent.id }),
      searchParams: Promise.resolve({ theme: "dark" }),
    });

    expect(mocks.mockNotFound).toHaveBeenCalled();
    expect(mocks.mockBuildSetlistPdfLayout).not.toHaveBeenCalled();
  });
});
