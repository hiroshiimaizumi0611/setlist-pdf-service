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
  it("marks template save names as required", async () => {
    mockGetAuthSessionWithPlan.mockResolvedValue({
      session: {
        user: {
          id: "user-1",
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
    mockListTemplates.mockResolvedValue([]);

    const result = await TemplatesPage();
    render(result);

    const header = screen.getByRole("banner");
    expect(screen.getByText("テンプレート管理")).toBeInTheDocument();
    expect(screen.getByLabelText("テンプレート名")).toBeRequired();
    expect(within(header).getByRole("button", { name: "ユーザーメニューを開く" })).toBeInTheDocument();
  });
});
