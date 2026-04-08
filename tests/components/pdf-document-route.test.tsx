import { beforeEach, describe, expect, it, vi } from "vitest";
import { oWestEvent } from "../fixtures/o-west-event";

const mocks = vi.hoisted(() => ({
  mockGetAuthSessionWithPlan: vi.fn(),
  mockGetEventForUser: vi.fn(),
  mockFindEventWithItemsById: vi.fn(),
  mockBuildSetlistPdfLayout: vi.fn(),
  mockVerifyPdfDocumentToken: vi.fn(),
  mockRedirect: vi.fn(),
  mockNotFound: vi.fn(),
  mockPdfDocument: vi.fn(),
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

vi.mock("@/lib/repositories/event-repository", () => ({
  findEventWithItemsById: mocks.mockFindEventWithItemsById,
}));

vi.mock("@/lib/pdf/build-layout", () => ({
  buildSetlistPdfLayout: mocks.mockBuildSetlistPdfLayout,
}));

vi.mock("@/lib/pdf/document-token", () => ({
  verifyPdfDocumentToken: mocks.mockVerifyPdfDocumentToken,
}));

vi.mock("@/components/pdf-document", () => ({
  PdfDocument: mocks.mockPdfDocument,
}));

import PdfDocumentRoute from "../../app/(app)/events/[eventId]/pdf/document/page";

describe("EventPdfDocument route wiring", () => {
  const mockLayout = {
    pageCount: 1,
    warnings: [],
    pages: [],
  };

  beforeEach(() => {
    mocks.mockGetAuthSessionWithPlan.mockReset();
    mocks.mockGetEventForUser.mockReset();
    mocks.mockFindEventWithItemsById.mockReset();
    mocks.mockBuildSetlistPdfLayout.mockReset();
    mocks.mockVerifyPdfDocumentToken.mockReset();
    mocks.mockRedirect.mockReset();
    mocks.mockNotFound.mockReset();
    mocks.mockPdfDocument.mockReset();
  });

  it("allows normal session access and falls back to dark when the theme query is invalid", async () => {
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

    const result = await PdfDocumentRoute({
      params: Promise.resolve({ eventId: oWestEvent.id }),
      searchParams: Promise.resolve({ theme: "sepia" }),
    });

    expect(mocks.mockGetEventForUser).toHaveBeenCalledWith({
      userId: "user-1",
      eventId: oWestEvent.id,
    });
    expect(mocks.mockBuildSetlistPdfLayout).toHaveBeenCalledWith({
      event: oWestEvent,
      theme: "dark",
      presetId: "standard-dark",
    });
    expect(result.props.event).toBe(oWestEvent);
    expect(result.props.layout).toBe(mockLayout);
  });

  it("allows valid token access without requiring a session", async () => {
    mocks.mockGetAuthSessionWithPlan.mockResolvedValue(null);
    mocks.mockVerifyPdfDocumentToken.mockReturnValue({
      eventId: oWestEvent.id,
      theme: "dark",
      preset: "large-type",
      exp: Math.floor(Date.now() / 1000) + 60,
    });
    mocks.mockFindEventWithItemsById.mockResolvedValue(oWestEvent);
    mocks.mockBuildSetlistPdfLayout.mockReturnValue(mockLayout);

    const result = await PdfDocumentRoute({
      params: Promise.resolve({ eventId: oWestEvent.id }),
      searchParams: Promise.resolve({
        theme: "dark",
        token: "valid-token",
        preset: "large-type",
      }),
    });

    expect(mocks.mockVerifyPdfDocumentToken).toHaveBeenCalledWith("valid-token");
    expect(mocks.mockFindEventWithItemsById).toHaveBeenCalledWith(oWestEvent.id);
    expect(mocks.mockGetEventForUser).not.toHaveBeenCalled();
    expect(mocks.mockBuildSetlistPdfLayout).toHaveBeenCalledWith({
      event: oWestEvent,
      theme: "dark",
      presetId: "large-type",
    });
    expect(result.props.event).toBe(oWestEvent);
    expect(result.props.layout).toBe(mockLayout);
  });

  it("renders the requested preset in the preview document for a signed-in free user", async () => {
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

    const result = await PdfDocumentRoute({
      params: Promise.resolve({ eventId: oWestEvent.id }),
      searchParams: Promise.resolve({ theme: "dark", preset: "large-type" }),
    });

    expect(mocks.mockBuildSetlistPdfLayout).toHaveBeenCalledWith({
      event: oWestEvent,
      theme: "dark",
      presetId: "large-type",
    });
    expect(result.props.event).toBe(oWestEvent);
    expect(result.props.layout).toBe(mockLayout);
  });

  it("rejects a mutated preset when the token was signed for a different preset", async () => {
    mocks.mockGetAuthSessionWithPlan.mockResolvedValue(null);
    mocks.mockVerifyPdfDocumentToken.mockReturnValue({
      eventId: oWestEvent.id,
      theme: "dark",
      preset: "standard-dark",
      exp: Math.floor(Date.now() / 1000) + 60,
    });

    await PdfDocumentRoute({
      params: Promise.resolve({ eventId: oWestEvent.id }),
      searchParams: Promise.resolve({
        theme: "dark",
        token: "valid-token",
        preset: "large-type",
      }),
    });

    expect(mocks.mockNotFound).toHaveBeenCalled();
    expect(mocks.mockFindEventWithItemsById).not.toHaveBeenCalled();
    expect(mocks.mockBuildSetlistPdfLayout).not.toHaveBeenCalled();
  });

  it("rejects invalid or expired tokens instead of falling back to session auth", async () => {
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
    mocks.mockVerifyPdfDocumentToken.mockReturnValue(null);

    await PdfDocumentRoute({
      params: Promise.resolve({ eventId: oWestEvent.id }),
      searchParams: Promise.resolve({
        theme: "dark",
        token: "expired-or-invalid-token",
      }),
    });

    expect(mocks.mockNotFound).toHaveBeenCalled();
    expect(mocks.mockGetEventForUser).not.toHaveBeenCalled();
    expect(mocks.mockFindEventWithItemsById).not.toHaveBeenCalled();
    expect(mocks.mockBuildSetlistPdfLayout).not.toHaveBeenCalled();
  });
});
