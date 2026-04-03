import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventList } from "../../components/event-list";

const baseTimestamp = new Date("2026-03-21T00:00:00.000Z");

describe("EventList", () => {
  it("shows editor rail actions without turning into an archive table", () => {
    render(
      <EventList
        events={[
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
        ]}
        currentEventId="event-nagoya-radhall"
        currentTheme="light"
        createEventAction={vi.fn()}
        duplicateEventAction={vi.fn()}
      />,
    );

    const navigation = screen.getByRole("navigation", { name: "公演ナビゲーション" });
    expect(within(navigation).getByRole("link", { current: "page" })).toHaveTextContent(
      "2026.03.28 名古屋 RADHALL",
    );
    expect(screen.getByRole("button", { name: "複製" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Theme" })).not.toBeInTheDocument();
  });
});
