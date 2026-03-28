import type { EventSummary, EventWithItems } from "@/lib/repositories/event-repository";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import type { AppPlan } from "@/lib/stripe/plans";
import type { SetlistItemType } from "@/lib/services/events-service";
import Link from "next/link";
import { DashboardShell, getDashboardThemeStyles } from "./dashboard-shell";
import { EventList } from "./event-list";
import { EventMetadataForm } from "./event-metadata-form";
import { SetlistItemForm } from "./setlist-item-form";
import { SetlistTable } from "./setlist-table";
import { ThemeToggle } from "./theme-toggle";
import { ExportPdfButton } from "./export-pdf-button";
import { TemplateSaveButton } from "./template-save-button";

type EventEditorPageContentProps = {
  events: EventSummary[];
  event: EventWithItems | null;
  currentTheme: PdfThemeName;
  currentPlan: AppPlan;
  editingItemId?: string | null;
  pendingDeleteItemId?: string | null;
  createEventAction?: (formData: FormData) => Promise<void>;
  duplicateEventAction?: (formData: FormData) => Promise<void>;
  updateMetadataAction?: (input: {
    eventId: string;
    title: string;
    venue?: string | null;
    eventDate?: Date | null;
    notes?: string | null;
  }) => Promise<unknown>;
  addItemAction?: (input: {
    eventId: string;
    itemType: SetlistItemType;
    title: string;
    artist?: string | null;
    durationSeconds?: number | null;
    notes?: string | null;
  }) => Promise<unknown>;
  updateItemAction?: (input: {
    eventId: string;
    itemId: string;
    itemType?: SetlistItemType;
    title?: string;
    artist?: string | null;
    durationSeconds?: number | null;
    notes?: string | null;
  }) => Promise<unknown>;
  reorderItemsAction?: (input: {
    eventId: string;
    orderedItemIds: string[];
  }) => Promise<unknown>;
  deleteItemAction?: (input: { eventId: string; itemId: string }) => Promise<unknown>;
  saveTemplateAction?: (formData: FormData) => Promise<void>;
};

function formatDateForSummary(value: Date | null) {
  if (!value) {
    return "日付未設定";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(value);
}

function parseOptionalDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function parseOptionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const ITEM_TYPE_OPTIONS: Array<{ value: SetlistItemType; label: string }> = [
  { value: "song", label: "曲" },
  { value: "mc", label: "MC" },
  { value: "transition", label: "転換" },
  { value: "heading", label: "見出し" },
];

export function EventEditorPageContent({
  events,
  event,
  currentTheme,
  currentPlan,
  editingItemId,
  pendingDeleteItemId,
  createEventAction,
  duplicateEventAction,
  updateMetadataAction,
  addItemAction,
  updateItemAction,
  reorderItemsAction,
  deleteItemAction,
  saveTemplateAction,
}: EventEditorPageContentProps) {
  const theme = getDashboardThemeStyles(currentTheme);
  const currentEventId = event?.id ?? null;
  const editingItem = event && editingItemId ? event.items.find((item) => item.id === editingItemId) ?? null : null;
  const lightHref = event ? `/events/${event.id}?theme=light` : "/events?theme=light";
  const darkHref = event ? `/events/${event.id}?theme=dark` : "/events?theme=dark";
  const sidebarChrome = (
    <div className="space-y-3">
      <section className={`border ${theme.railBorder} ${theme.panelMuted} px-4 py-4`}>
        <p className={`font-mono text-[11px] uppercase tracking-[0.3em] ${theme.mutedText}`}>
          {theme.headerMeta === "LIVE VIEW" ? "BACKSTAGE ACCESS" : "PRODUCTION"}
        </p>
        <p className={`mt-2 text-xs uppercase tracking-[0.24em] ${theme.mutedText}`}>
          {theme.headerMeta === "LIVE VIEW" ? "TECHNICAL SIDEBAR" : "MASTER SCHEDULE"}
        </p>
        <p className={`mt-3 border-t border-dashed ${theme.railBorder} pt-3 text-xs uppercase tracking-[0.24em] ${theme.mutedText}`}>
          {event?.venue ? event.venue : "TOKYO GARDEN THEATER"}
        </p>
      </section>

      <form action={createEventAction} className="contents">
        <input type="hidden" name="theme" value={currentTheme} />
        <button
          type="submit"
          className={`${theme.buttonPrimary} min-h-11 w-full px-4 py-3 text-sm font-black tracking-[0.14em] uppercase`}
        >
          新規公演作成
        </button>
      </form>

      <Link
        href={`/events?theme=${currentTheme}`}
        className={`${theme.buttonSecondary} inline-flex min-h-11 w-full items-center justify-center px-4 text-sm font-black tracking-[0.14em] uppercase`}
      >
        アーカイブ
      </Link>

      <EventList
        events={events}
        currentEventId={currentEventId}
        currentTheme={currentTheme}
        duplicateEventAction={duplicateEventAction}
      />
    </div>
  );

  if (!event) {
    return (
      <DashboardShell
        currentTheme={currentTheme}
        sidebar={sidebarChrome}
        eyebrow="セットリスト編集"
        title="新規公演を準備"
        description="左の作成ボタンから最初の公演を作成すると、ここに本番用の進行表エディタが表示されます。"
        headerActions={
          <ThemeToggle
            currentTheme={currentTheme}
            lightHref={lightHref}
            darkHref={darkHref}
          />
        }
      >
        <section className={`border ${theme.border} ${theme.panel} p-6`}>
          <p className={`font-mono text-[11px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
            編集待機
          </p>
          <h2 className="mt-3 font-mono text-3xl font-black tracking-[-0.08em]">
            公演を作成してセットリスト編集を開始
          </h2>
          <p className={`mt-3 max-w-2xl text-sm leading-7 ${theme.mutedText}`}>
            公演ごとに曲順・転換・メモを整理し、そのまま印刷向けPDFへ書き出せます。
          </p>
        </section>
      </DashboardShell>
    );
  }

  const metadataFormAction = async (formData: FormData) => {
    "use server";

    if (!updateMetadataAction) {
      return;
    }

    await updateMetadataAction({
      eventId: event.id,
      title: String(formData.get("title") ?? ""),
      venue: String(formData.get("venue") ?? "") || null,
      eventDate: parseOptionalDate(formData.get("eventDate")),
      notes: String(formData.get("notes") ?? "") || null,
    });
  };

  const addItemFormAction = async (formData: FormData) => {
    "use server";

    if (!addItemAction) {
      return;
    }

    await addItemAction({
      eventId: event.id,
      itemType: String(formData.get("itemType") ?? "song") as SetlistItemType,
      title: String(formData.get("title") ?? ""),
      artist: String(formData.get("artist") ?? "") || null,
      durationSeconds: parseOptionalNumber(formData.get("durationSeconds")),
      notes: String(formData.get("notes") ?? "") || null,
    });
  };

  const headerDescription = [
    formatDateForSummary(event.eventDate),
    event.venue || "会場未設定",
    `${event.items.length}項目`,
  ].join(" / ");

  return (
    <DashboardShell
      currentTheme={currentTheme}
      sidebar={sidebarChrome}
      eyebrow="技術進行シート"
      title={event.title}
      description={`${headerDescription}。本番進行・曲順・補足メモをひとつの紙面感覚で管理できます。`}
      headerActions={
        <>
          <ThemeToggle
            currentTheme={currentTheme}
            lightHref={lightHref}
            darkHref={darkHref}
          />
          <ExportPdfButton
            currentTheme={currentTheme}
            href={`/api/events/${event.id}/pdf?theme=${currentTheme}`}
          />
        </>
      }
    >
      <div className="space-y-3">
        <EventMetadataForm
          event={event}
          currentTheme={currentTheme}
          updateMetadataAction={metadataFormAction}
          headerActions={
            <TemplateSaveButton
              plan={currentPlan}
              currentTheme={currentTheme}
              mode="event"
              sourceEventId={event.id}
              defaultName={event.title}
              defaultDescription={event.notes ?? ""}
              saveTemplateAction={saveTemplateAction}
            />
          }
        />

        <SetlistItemForm
          currentTheme={currentTheme}
          addItemAction={addItemFormAction}
        />

        {editingItem ? (
          <section
            data-editor-strip="edit-item"
            className={`overflow-hidden border-2 ${theme.border} ${theme.panel}`}
          >
            <div className={`flex flex-col gap-2 border-b-2 ${theme.border} px-4 py-3 sm:flex-row sm:items-center sm:justify-between`}>
              <div>
                <p className={`font-mono text-[10px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
                  Edit Route
                </p>
                <h2 className="mt-1 font-mono text-xl font-black tracking-[-0.05em]">
                  編集対象
                </h2>
              </div>
              <Link
                href={`/events/${event.id}?theme=${currentTheme}`}
                className={`${theme.buttonSecondary} inline-flex min-h-10 items-center justify-center px-4 text-xs font-black tracking-[0.18em] uppercase`}
              >
                編集を閉じる
              </Link>
            </div>

            <form
              action={async (formData: FormData) => {
                "use server";

                if (!updateItemAction) {
                  return;
                }

                await updateItemAction({
                  eventId: event.id,
                  itemId: editingItem.id,
                  itemType: String(formData.get("itemType") ?? editingItem.itemType) as SetlistItemType,
                  title: String(formData.get("title") ?? ""),
                  artist: String(formData.get("artist") ?? "") || null,
                  durationSeconds: parseOptionalNumber(formData.get("durationSeconds")),
                  notes: String(formData.get("notes") ?? "") || null,
                });
              }}
              aria-label={`${editingItem.title} の編集フォーム`}
              className="grid gap-4 px-4 py-4"
            >
              <div className="grid gap-3 md:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
                <label className="grid gap-2 text-sm font-medium">
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em]">項目種別</span>
                  <select
                    name="itemType"
                    defaultValue={editingItem.itemType}
                    className={`${theme.input} min-h-10 px-4 py-2.5`}
                  >
                    {ITEM_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em]">タイトル</span>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingItem.title}
                    required
                    className={`${theme.input} min-h-10 px-4 py-2.5`}
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <label className="grid gap-2 text-sm font-medium">
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em]">アーティスト</span>
                  <input
                    type="text"
                    name="artist"
                    defaultValue={editingItem.artist ?? ""}
                    placeholder="任意"
                    className={`${theme.inputMuted} min-h-10 px-4 py-2.5`}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em]">尺(秒)</span>
                  <input
                    type="number"
                    min="0"
                    name="durationSeconds"
                    defaultValue={editingItem.durationSeconds ?? ""}
                    placeholder="任意"
                    className={`${theme.inputMuted} min-h-10 px-4 py-2.5`}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em]">メモ</span>
                  <input
                    type="text"
                    name="notes"
                    defaultValue={editingItem.notes ?? ""}
                    placeholder="任意"
                    className={`${theme.inputMuted} min-h-10 px-4 py-2.5`}
                  />
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`${theme.buttonPrimary} min-h-10 px-5 text-sm font-black tracking-[0.14em] uppercase`}
                >
                  変更を保存
                </button>
              </div>
            </form>
          </section>
        ) : null}
      </div>

      <SetlistTable
        currentTheme={currentTheme}
        eventId={event.id}
        items={event.items}
        pendingDeleteItemId={pendingDeleteItemId}
        reorderItemsAction={reorderItemsAction}
        updateItemAction={updateItemAction}
        deleteItemAction={deleteItemAction}
      />
    </DashboardShell>
  );
}
