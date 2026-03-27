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

export function EventEditorPageContent({
  events,
  event,
  currentTheme,
  currentPlan,
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
  const lightHref = event ? `/events/${event.id}?theme=light` : "/events?theme=light";
  const darkHref = event ? `/events/${event.id}?theme=dark` : "/events?theme=dark";
  const sidebarChrome = (
    <div className="space-y-4">
      <section className={`border-2 ${theme.border} ${theme.panel} px-4 py-4`}>
        <p className={`font-mono text-[11px] uppercase tracking-[0.3em] ${theme.mutedText}`}>
          BACKSTAGE ACCESS
        </p>
        <p className={`mt-2 text-xs uppercase tracking-[0.24em] ${theme.mutedText}`}>
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

      <div className="[&>div>div:first-child]:hidden [&>div>form]:hidden">
        <EventList
          events={events}
          currentEventId={currentEventId}
          currentTheme={currentTheme}
          createEventAction={createEventAction}
          duplicateEventAction={duplicateEventAction}
        />
      </div>
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
        <section className={`border-2 ${theme.border} ${theme.panel} p-6`}>
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
