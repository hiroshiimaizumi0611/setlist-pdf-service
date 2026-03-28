import { render, screen, within } from "@testing-library/react";
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

function requireElement(value: Element | null, message: string): HTMLElement {
  if (!value) {
    throw new Error(message);
  }

  return value as HTMLElement;
}

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

    expect(screen.getByText("BACKSTAGE PRO")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "新規公演作成" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "PDF出力" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "アーカイブ" })).toBeInTheDocument();
    expect(screen.getByText("PRODUCTION")).toBeInTheDocument();
    expect(screen.getByText("MASTER SCHEDULE")).toBeInTheDocument();
    expect(screen.getByText(/CURRENT SHOW:/)).toBeInTheDocument();
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
    expect(screen.getAllByText("見出し").length).toBeGreaterThan(0);
    expect(screen.getByText("EN")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "セットリスト" })).toBeInTheDocument();
    const setlistSection = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
    expect(setlistSection).toBeTruthy();
    if (!setlistSection) {
      throw new Error("expected setlist section");
    }
    const firstSongRow = requireElement(
      setlistSection.querySelector('article[data-row-variant="song"]'),
      "expected first song row",
    );
    expect(setlistSection.querySelector("details")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /上へ移動/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /下へ移動/ })).not.toBeInTheDocument();
    expect(within(firstSongRow).getByRole("link", { name: "編集" })).toHaveAttribute(
      "href",
      `/events/${event.id}?theme=light&editItem=${event.items[0].id}`,
    );
    expect(within(firstSongRow).getByText("削除")).toBeInTheDocument();
    const desktopActions = requireElement(
      firstSongRow.querySelector('[data-row-actions="desktop"]'),
      "expected desktop action cluster",
    );
    expect(within(desktopActions).getByText("編集")).toBeInTheDocument();
    expect(within(desktopActions).getByText("削除")).toBeInTheDocument();
    expect(within(firstSongRow).getByLabelText("緑 をドラッグして並び替え")).toHaveClass(
      "hidden",
    );
    expect(screen.getByRole("link", { name: "PDF出力" })).toHaveAttribute(
      "href",
      "/events/event-nagoya-radhall/pdf?theme=light",
    );
    expect(screen.getByRole("link", { name: "Proでテンプレート保存を有効化" })).toHaveAttribute(
      "href",
      "/settings/billing",
    );
    expect(screen.getByRole("link", { name: "ライトテーマ" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ダークテーマ" })).toBeInTheDocument();
  }, 20_000);

  it("shows a route-driven edit form without inline row expansion", () => {
    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="light"
        currentPlan="free"
        editingItemId="item-1"
        updateItemAction={mockUpdateItemAction}
      />,
    );

    expect(screen.queryByRole("heading", { name: "セットリスト編集" })).not.toBeInTheDocument();
    const editPanel = screen.getByRole("heading", { name: "編集対象" }).closest("section");
    expect(editPanel).toBeTruthy();
    if (!editPanel) {
      throw new Error("expected edit panel");
    }
    expect(within(editPanel).getByLabelText("項目種別")).toHaveValue("song");
    expect(within(editPanel).getByLabelText("タイトル")).toHaveValue("緑");
    expect(within(editPanel).getByRole("link", { name: "編集を閉じる" })).toHaveAttribute(
      "href",
      "/events/event-nagoya-radhall?theme=light",
    );
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
    expect(screen.getByText("SHOWRUNNER")).toBeInTheDocument();
    expect(screen.getByText("BACKSTAGE ACCESS")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "公演情報" })).not.toBeInTheDocument();

    const shell = screen.getByRole("main");
    expect(shell).toHaveClass("bg-[#0f0f10]");

    const header = shell.querySelector("header");
    expect(header).toBeTruthy();
    if (!header) {
      throw new Error("expected dark header shell");
    }
    expect(header).toHaveClass("bg-[#131313]/92");
    expect(header).toHaveClass("border-[#fff6df]/10");

    const rail = navigation.closest("aside");
    expect(rail).toBeTruthy();
    if (!rail) {
      throw new Error("expected dark event rail");
    }
    expect(rail).toHaveClass("bg-[#161616]");
    expect(rail).toHaveClass("lg:w-60");

    const currentEventLink = within(navigation).getByRole("link", { current: "page" });
    const currentEventCard = currentEventLink.closest("article");
    expect(currentEventCard).toBeTruthy();
    if (!currentEventCard) {
      throw new Error("expected current event card");
    }
    expect(currentEventCard).toHaveClass("bg-[#3a3a3a]");
    expect(currentEventCard).toHaveClass("text-[#f6c453]");
    expect(currentEventCard).toHaveClass("border-[#f6c453]");

    const metadataStrip = screen.getByText("Show Info").closest("section");
    expect(metadataStrip).toBeTruthy();
    if (!metadataStrip) {
      throw new Error("expected metadata strip");
    }
    expect(metadataStrip).toHaveAttribute("data-editor-strip", "metadata");
    expect(within(metadataStrip).getByText("Compact metadata strip for the printed show sheet.")).toHaveAttribute(
      "data-strip-description",
      "supporting",
    );
    expect(within(metadataStrip).getByRole("status", { name: "Sheet Theme" })).toHaveAttribute(
      "data-strip-field-tone",
      "muted",
    );
    expect(within(metadataStrip).getByRole("button", { name: "Save Metadata" })).toHaveAttribute(
      "data-strip-action",
      "metadata-save",
    );

    const addStrip = screen.getByText("Add Production Item").closest("section");
    expect(addStrip).toBeTruthy();
    if (!addStrip) {
      throw new Error("expected add-item strip");
    }
    expect(addStrip).toHaveAttribute("data-editor-strip", "add-item");
    expect(within(addStrip).getByRole("button", { name: "ADD TO SET" })).toHaveAttribute(
      "data-strip-action",
      "add-item",
    );
    expect(within(addStrip).getByText("追加設定").closest("summary")).toHaveAttribute(
      "data-strip-action",
      "toggle-advanced",
    );

    const firstSongRow = screen.getByText("緑").closest("article");
    expect(firstSongRow).toBeTruthy();
    if (!firstSongRow) {
      throw new Error("expected first song row");
    }
    expect(firstSongRow).toHaveAttribute("data-row-variant", "song");
    expect(firstSongRow).toHaveAttribute("data-row-rhythm", "setlist");
    expect(within(firstSongRow).getByText("M01")).toHaveAttribute("data-row-cue", "song");
    expect(within(firstSongRow).getByText("緑")).toHaveAttribute("data-row-title", "song");

    const mcRow = requireElement(
      shell.querySelector('article[data-row-variant="mc"]'),
      "expected MC row",
    );
    expect(mcRow).toHaveAttribute("data-row-variant", "mc");
    expect(within(mcRow).getByText("MC / TALK")).toHaveAttribute("data-row-label", "mc");
    expect(
      requireElement(
        mcRow.querySelector('[data-row-title="mc"]'),
        "expected MC row title",
      ),
    ).toHaveTextContent("MC");

    const transitionRow = requireElement(
      shell.querySelector('article[data-row-variant="transition"]'),
      "expected transition row",
    );
    expect(transitionRow).toHaveAttribute("data-row-variant", "transition");
    expect(within(transitionRow).getByText("CHANGEOVER")).toHaveAttribute(
      "data-row-label",
      "transition",
    );
    expect(
      requireElement(
        transitionRow.querySelector('[data-row-title="transition"]'),
        "expected transition row title",
      ),
    ).toHaveTextContent("転換");

    const headingRow = requireElement(
      shell.querySelector('article[data-row-variant="heading"]'),
      "expected heading row",
    );
    expect(headingRow).toHaveAttribute("data-row-variant", "heading");
    expect(within(headingRow).getByText("SECTION BREAK")).toHaveAttribute(
      "data-row-label",
      "heading",
    );
    expect(within(headingRow).getByText("EN")).toHaveAttribute("data-row-cue", "heading");
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
      "/events/event-nagoya-radhall/pdf?theme=dark",
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
