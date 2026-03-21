import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { nagoyaRadhallEvent } from "../fixtures/nagoya-radhall-event";
import { EventEditorPageContent } from "../../app/(app)/events/[eventId]/page";

const baseTimestamp = new Date("2026-03-21T00:00:00.000Z");

const eventSummaries = [
  {
    id: "event-nagoya-radhall",
    ownerUserId: "user-1",
    title: nagoyaRadhallEvent.title,
    venue: nagoyaRadhallEvent.venue,
    eventDate: nagoyaRadhallEvent.eventDate,
    notes: nagoyaRadhallEvent.notes,
    createdAt: baseTimestamp,
    updatedAt: baseTimestamp,
    itemCount: nagoyaRadhallEvent.items.length,
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
];

const event = {
  id: eventSummaries[0].id,
  ownerUserId: "user-1",
  title: nagoyaRadhallEvent.title,
  venue: nagoyaRadhallEvent.venue,
  eventDate: nagoyaRadhallEvent.eventDate,
  notes: nagoyaRadhallEvent.notes,
  createdAt: baseTimestamp,
  updatedAt: baseTimestamp,
  items: nagoyaRadhallEvent.items.map((item, index) => ({
    id: `item-${index + 1}`,
    eventId: eventSummaries[0].id,
    position: index + 1,
    itemType: item.itemType,
    title: item.title,
    artist: null,
    durationSeconds: null,
    notes: null,
    createdAt: baseTimestamp,
    updatedAt: baseTimestamp,
  })),
};

describe("EventEditorPageContent", () => {
  it("renders the editor affordances for a free account", () => {
    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="light"
        currentPlan="free"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "2026.03.28 名古屋 RADHALL" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "公演ナビゲーション" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "公演情報" })).toBeInTheDocument();
    expect(screen.getByLabelText("公演名")).toHaveValue("2026.03.28 名古屋 RADHALL");
    expect(screen.getByLabelText("会場")).toHaveValue("RADHALL");
    expect(screen.getByRole("heading", { name: "項目追加" })).toBeInTheDocument();
    expect(screen.getByLabelText("項目種別")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "項目を追加" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "セットリスト" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ねえ！もう実験は終わりにしよう！ を上へ移動" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "緑 を下へ移動" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "PDFを書き出し" })).toHaveAttribute(
      "href",
      "/api/events/event-nagoya-radhall/pdf?theme=light",
    );
    expect(screen.getByRole("link", { name: "Proでテンプレート保存を有効化" })).toHaveAttribute(
      "href",
      "/settings/billing",
    );
    expect(screen.getByRole("link", { name: "ライトテーマ" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ダークテーマ" })).toBeInTheDocument();
  });

  it("shows the template save form when the account is pro", () => {
    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="dark"
        currentPlan="pro"
      />,
    );

    expect(screen.getByRole("button", { name: "この内容をテンプレート保存" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "PDFを書き出し" })).toHaveAttribute(
      "href",
      "/api/events/event-nagoya-radhall/pdf?theme=dark",
    );
  });
});
