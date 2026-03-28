import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
const mockDeleteEventAction = vi.fn().mockResolvedValue(undefined);
const mockDuplicateEventAction = vi.fn().mockResolvedValue(undefined);

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
        duplicateEventAction={mockDuplicateEventAction}
        updateItemAction={mockUpdateItemAction}
        deleteEventAction={mockDeleteEventAction}
      />,
    );

    expect(screen.getByText("BACKSTAGE PRO")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "新規公演作成" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "PDF出力" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "アーカイブ" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "このセットリストを削除" })).toBeInTheDocument();
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
    expect(within(navigation).getAllByRole("button", { name: "複製" }).length).toBeGreaterThan(0);
    expect(within(navigation).getAllByRole("button", { name: "削除" }).length).toBeGreaterThan(0);
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
    expect(within(firstSongRow).getByRole("button", { name: "編集" })).toBeInTheDocument();
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

  it("opens a centered edit modal with current item values and closes without changing row structure", () => {
    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="light"
        currentPlan="free"
        updateItemAction={mockUpdateItemAction}
        deleteEventAction={mockDeleteEventAction}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const setlistSection = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
    expect(setlistSection).toBeTruthy();
    if (!setlistSection) {
      throw new Error("expected setlist section");
    }
    const rowCountBeforeOpen = setlistSection.querySelectorAll("article").length;

    fireEvent.click(screen.getAllByRole("button", { name: "編集" })[0]);

    const dialog = screen.getByRole("dialog", { name: "セットリスト項目を編集" });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByLabelText("項目種別")).toHaveValue("song");
    expect(within(dialog).getByLabelText("タイトル")).toHaveValue("緑");
    expect(within(dialog).getByLabelText("アーティスト")).toHaveValue("");
    expect(within(dialog).getByRole("button", { name: "キャンセル" })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "キャンセル" }));

    expect(screen.queryByRole("dialog", { name: "セットリスト項目を編集" })).not.toBeInTheDocument();
    expect(setlistSection.querySelectorAll("article")).toHaveLength(rowCountBeforeOpen);
    expect(setlistSection.querySelector('[data-editor-strip="edit-item"]')).not.toBeInTheDocument();
  });

  it("keeps modal-triggered editing available for song, MC, and transition rows", () => {
    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="dark"
        currentPlan="free"
        updateItemAction={mockUpdateItemAction}
        deleteEventAction={mockDeleteEventAction}
      />,
    );

    const rowExpectations = [
      { variant: "song", title: "緑", itemType: "song" },
      { variant: "mc", title: "MC", itemType: "mc" },
      { variant: "transition", title: "転換", itemType: "transition" },
    ] as const;

    for (const rowExpectation of rowExpectations) {
      const row = requireElement(
        document.querySelector(`article[data-row-variant="${rowExpectation.variant}"]`),
        `expected ${rowExpectation.variant} row`,
      );

      fireEvent.click(within(row).getByRole("button", { name: "編集" }));

      const dialog = screen.getByRole("dialog", { name: "セットリスト項目を編集" });
      expect(within(dialog).getByLabelText("項目種別")).toHaveValue(rowExpectation.itemType);
      expect(within(dialog).getByLabelText("タイトル")).toHaveValue(rowExpectation.title);

      fireEvent.click(within(dialog).getByRole("button", { name: "キャンセル" }));
      expect(
        screen.queryByRole("dialog", { name: "セットリスト項目を編集" }),
      ).not.toBeInTheDocument();
    }
  });

  it("keeps the edit modal scrollable on shorter viewports", () => {
    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="light"
        currentPlan="free"
        updateItemAction={mockUpdateItemAction}
        deleteEventAction={mockDeleteEventAction}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "編集" })[0]);

    const dialog = screen.getByRole("dialog", { name: "セットリスト項目を編集" });
    expect(dialog).toHaveClass("max-h-[calc(100vh-4rem)]");
    expect(dialog).toHaveClass("overflow-y-auto");
  });

  it("submits modal edits through updateItemAction and closes after save", async () => {
    const updateItemAction = vi.fn().mockResolvedValue(undefined);

    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="light"
        currentPlan="free"
        updateItemAction={updateItemAction}
        deleteEventAction={mockDeleteEventAction}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "編集" })[0]);

    const dialog = screen.getByRole("dialog", { name: "セットリスト項目を編集" });
    fireEvent.change(within(dialog).getByLabelText("タイトル"), {
      target: { value: "緑 (改)" },
    });
    fireEvent.change(within(dialog).getByLabelText("アーティスト"), {
      target: { value: "Test Artist" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "変更を保存" }));

    await waitFor(() =>
      expect(updateItemAction).toHaveBeenCalledWith({
        eventId: event.id,
        itemId: "item-1",
        itemType: "song",
        title: "緑 (改)",
        artist: "Test Artist",
        durationSeconds: null,
        notes: null,
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "セットリスト項目を編集" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("submits desktop drag reorder by inserting before the hovered row when dragging downward", async () => {
    const reorderItemsAction = vi.fn().mockResolvedValue(undefined);

    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="light"
        currentPlan="free"
        updateItemAction={mockUpdateItemAction}
        reorderItemsAction={reorderItemsAction}
        deleteEventAction={mockDeleteEventAction}
      />,
    );

    const setlistSection = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
    expect(setlistSection).toBeTruthy();
    if (!setlistSection) {
      throw new Error("expected setlist section");
    }

    const rows = setlistSection.querySelectorAll('article[data-row-variant="song"]');
    expect(rows.length).toBeGreaterThan(2);

    const firstRow = requireElement(rows[0], "expected first song row");
    const thirdRow = requireElement(rows[2], "expected third song row");

    const firstHandle = within(firstRow).getByLabelText("緑 をドラッグして並び替え");
    expect(firstHandle).toHaveClass("hidden");
    expect(firstHandle).toHaveAttribute("draggable", "true");
    expect(firstRow).not.toHaveAttribute("draggable");

    fireEvent.dragStart(firstHandle, {
      dataTransfer: {
        effectAllowed: "move",
        setData: vi.fn(),
      },
    });
    fireEvent.dragOver(thirdRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });
    fireEvent.drop(thirdRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });

    await waitFor(() =>
      expect(reorderItemsAction).toHaveBeenCalledWith({
        eventId: event.id,
        orderedItemIds: [
          event.items[1].id,
          event.items[0].id,
          event.items[2].id,
          ...event.items.slice(3).map((item) => item.id),
        ],
      }),
    );
  });

  it("submits desktop drag reorder by inserting before the hovered row when dragging upward", async () => {
    const reorderItemsAction = vi.fn().mockResolvedValue(undefined);

    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="light"
        currentPlan="free"
        updateItemAction={mockUpdateItemAction}
        reorderItemsAction={reorderItemsAction}
        deleteEventAction={mockDeleteEventAction}
      />,
    );

    const setlistSection = screen.getByRole("heading", { name: "セットリスト" }).closest("section");
    expect(setlistSection).toBeTruthy();
    if (!setlistSection) {
      throw new Error("expected setlist section");
    }

    const rows = setlistSection.querySelectorAll('article[data-row-variant="song"]');
    expect(rows.length).toBeGreaterThan(2);

    const firstRow = requireElement(rows[0], "expected first song row");
    const thirdRow = requireElement(rows[2], "expected third song row");

    const thirdHandle = within(thirdRow).getByLabelText(
      "Dendrobium をドラッグして並び替え",
    );
    expect(thirdHandle).toHaveClass("hidden");
    expect(thirdHandle).toHaveAttribute("draggable", "true");
    expect(thirdRow).not.toHaveAttribute("draggable");

    fireEvent.dragStart(thirdHandle, {
      dataTransfer: {
        effectAllowed: "move",
        setData: vi.fn(),
      },
    });
    fireEvent.dragOver(firstRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });
    fireEvent.drop(firstRow, {
      dataTransfer: {
        dropEffect: "move",
      },
    });

    await waitFor(() =>
      expect(reorderItemsAction).toHaveBeenCalledWith({
        eventId: event.id,
        orderedItemIds: [
          event.items[2].id,
          event.items[0].id,
          event.items[1].id,
          ...event.items.slice(3).map((item) => item.id),
        ],
      }),
    );
  });

  it("opens a delete confirmation modal from the sidebar and current editor", async () => {
    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="light"
        currentPlan="free"
        updateItemAction={mockUpdateItemAction}
        deleteEventAction={mockDeleteEventAction}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "削除" })[0]);
    const sidebarDialog = screen.getByRole("dialog", { name: "このセットリストを削除しますか？" });
    expect(sidebarDialog).toBeInTheDocument();
    expect(within(sidebarDialog).getByText("2026.03.28 名古屋 RADHALL")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "このセットリストを削除しますか？" })).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "このセットリストを削除" }));
    expect(screen.getByRole("dialog", { name: "このセットリストを削除しますか？" })).toBeInTheDocument();
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
    expect(firstSongRow.className).toContain("transition-colors");

    const firstSongContent = requireElement(
      firstSongRow.querySelector('[data-row-content="primary"]'),
      "expected primary row content block",
    );
    expect(firstSongContent.className).toContain("py-3");

    const firstSongActions = requireElement(
      firstSongRow.querySelector('[data-row-actions="desktop"]'),
      "expected desktop action cluster",
    );
    expect(firstSongActions.className).toContain("md:flex-nowrap");
    expect(firstSongActions.className).toContain("items-center");

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

  it("renders delete confirmation controls for heading rows", () => {
    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="light"
        currentPlan="free"
        pendingDeleteItemId="item-8"
        updateItemAction={mockUpdateItemAction}
      />,
    );

    const headingRow = requireElement(
      document.querySelector('article[data-row-variant="heading"]'),
      "expected heading row",
    );
    const headingActions = requireElement(
      headingRow.querySelector('[data-row-actions="desktop"]'),
      "expected heading action cluster",
    );

    expect(within(headingActions).getByRole("button", { name: "EN の削除を確定" })).toBeInTheDocument();
    expect(within(headingActions).getByRole("link", { name: "キャンセル" })).toHaveAttribute(
      "href",
      "/events/event-nagoya-radhall?theme=light",
    );
  });

  it("submits delete confirmation through deleteItemAction from the compact action cluster", async () => {
    const deleteItemAction = vi.fn().mockResolvedValue(undefined);

    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="light"
        currentPlan="free"
        pendingDeleteItemId="item-1"
        updateItemAction={mockUpdateItemAction}
        deleteItemAction={deleteItemAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "緑 の削除を確定" }));

    await waitFor(() =>
      expect(deleteItemAction).toHaveBeenCalledWith({
        eventId: event.id,
        itemId: "item-1",
      }),
    );
  });

  it("submits heading delete confirmation through deleteItemAction", async () => {
    const deleteItemAction = vi.fn().mockResolvedValue(undefined);

    render(
      <EventEditorPageContent
        events={eventSummaries}
        event={event}
        currentTheme="light"
        currentPlan="free"
        pendingDeleteItemId="item-8"
        updateItemAction={mockUpdateItemAction}
        deleteItemAction={deleteItemAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "EN の削除を確定" }));

    await waitFor(() =>
      expect(deleteItemAction).toHaveBeenCalledWith({
        eventId: event.id,
        itemId: "item-8",
      }),
    );
  });
});
