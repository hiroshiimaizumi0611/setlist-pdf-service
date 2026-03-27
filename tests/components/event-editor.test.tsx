import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

const mockUpdateItemAction = vi.fn().mockResolvedValue(undefined);

describe("EventEditorPageContent", () => {
  it("renders the editor affordances for a free account", () => {
    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="light"
        currentPlan="free"
        updateItemAction={mockUpdateItemAction}
      />,
    );

    expect(screen.getByText("SHOWRUNNER")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "新規公演作成" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "PDF出力" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "アーカイブ" })).toBeInTheDocument();
    expect(screen.getByText("BACKSTAGE ACCESS")).toBeInTheDocument();
    expect(screen.getByText("CURRENT SHOW:")).toBeInTheDocument();
    expect(screen.getByText("Upcoming & Recent")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "2026.03.28 名古屋 RADHALL" }),
    ).toBeInTheDocument();
    const navigation = screen.getByRole("navigation", { name: "公演ナビゲーション" });
    expect(navigation).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { current: "page" })).toHaveTextContent(
      "2026.03.28 名古屋 RADHALL",
    );
    expect(screen.getByLabelText("Date")).toHaveValue("2026-03-28");
    expect(screen.getByLabelText("Venue")).toHaveValue("RADHALL");
    expect(screen.getByLabelText("Show Title")).toHaveValue("2026.03.28 名古屋 RADHALL");
    expect(screen.getByLabelText("Show Title")).toBeRequired();
    expect(screen.getByRole("status", { name: "Sheet Theme" })).toHaveTextContent("Light");
    expect(screen.getByRole("button", { name: "Save Metadata" })).toBeInTheDocument();
    expect(screen.getByText("Add Production Item")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "曲" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "MC" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "転換" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "見出し" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("曲名や進行メモを入力")).toBeRequired();
    expect(screen.getByRole("button", { name: "ADD TO SET" })).toBeInTheDocument();
    const addStrip = screen.getByText("Add Production Item").closest("section");
    expect(addStrip).toBeTruthy();
    if (!addStrip) {
      throw new Error("expected add-item strip to exist");
    }
    expect(within(addStrip).getByText("追加設定")).toBeInTheDocument();
    expect(addStrip.querySelector("details")).not.toHaveAttribute("open");
    expect(within(addStrip).getByLabelText("アーティスト")).toBeInTheDocument();
    expect(within(addStrip).getByLabelText("尺(秒)")).toBeInTheDocument();
    expect(within(addStrip).getByLabelText("メモ")).toBeInTheDocument();
    expect(screen.getByText("M01")).toBeInTheDocument();
    expect(screen.getByText("M02")).toBeInTheDocument();
    expect(screen.getByText("MC / TALK")).toBeInTheDocument();
    expect(screen.getByText("CHANGEOVER")).toBeInTheDocument();
    expect(screen.getByText("ENCORE")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "セットリスト" })).toBeInTheDocument();
    expect(screen.getAllByText("編集").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByText("編集")[1]);
    const editForm = screen.getByRole("form", {
      name: "ねえ！もう実験は終わりにしよう！ の編集フォーム",
    });
    expect(within(editForm).getByLabelText("項目種別")).toHaveValue("song");
    expect(within(editForm).getByLabelText("タイトル")).toHaveValue(
      "ねえ！もう実験は終わりにしよう！",
    );
    expect(within(editForm).getByLabelText("タイトル")).toBeRequired();
    expect(screen.getByRole("button", { name: "ねえ！もう実験は終わりにしよう！ を上へ移動" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "緑 を下へ移動" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "PDF出力" })).toHaveAttribute(
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

  it("renders a Stitch-like rail and compact metadata strip", () => {
    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="dark"
        currentPlan="free"
        updateItemAction={mockUpdateItemAction}
      />,
    );

    const navigation = screen.getByRole("navigation", { name: "公演ナビゲーション" });
    expect(within(navigation).getByText("Upcoming & Recent")).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { current: "page" })).toHaveTextContent(
      "2026.03.28 名古屋 RADHALL",
    );
    expect(screen.getByLabelText("Date")).toHaveValue("2026-03-28");
    expect(screen.getByLabelText("Venue")).toHaveValue("RADHALL");
    expect(screen.getByLabelText("Show Title")).toHaveValue("2026.03.28 名古屋 RADHALL");
    expect(screen.getByRole("status", { name: "Sheet Theme" })).toHaveTextContent("Dark");
    expect(screen.queryByRole("heading", { name: "公演情報" })).not.toBeInTheDocument();
  });

  it("shows the template save form when the account is pro", () => {
    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="dark"
        currentPlan="pro"
        updateItemAction={mockUpdateItemAction}
      />,
    );

    expect(screen.getByRole("button", { name: "この内容をテンプレート保存" })).toBeInTheDocument();
    expect(screen.getByLabelText("テンプレート名")).toBeRequired();
    expect(screen.getByRole("link", { name: "PDF出力" })).toHaveAttribute(
      "href",
      "/api/events/event-nagoya-radhall/pdf?theme=dark",
    );
  });

  it("renders a server-side delete confirmation state", () => {
    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="light"
        currentPlan="free"
        pendingDeleteItemId="item-1"
        updateItemAction={mockUpdateItemAction}
      />,
    );

    expect(screen.getByRole("button", { name: "緑 の削除を確定" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "キャンセル" })).toHaveAttribute(
      "href",
      "/events/event-nagoya-radhall?theme=light",
    );
  });
});
