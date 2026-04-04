"use client";

import type { EventSummary } from "@/lib/repositories/event-repository";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import type { AppPlan } from "@/lib/stripe/plans";
import type { AuthenticatedUserIdentity } from "@/lib/user-identity";
import { useMemo, useState } from "react";
import { AppGlobalNav } from "./app-global-nav";
import { DashboardShell, getDashboardThemeStyles } from "./dashboard-shell";
import { FormPendingButton } from "./form-pending-button";
import { PerformanceArchiveFilters } from "./performance-archive-filters";
import { PerformanceArchiveTable } from "./performance-archive-table";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

type PerformanceArchivePageContentProps = {
  events: EventSummary[];
  currentTheme: PdfThemeName;
  currentPlan: AppPlan;
  userIdentity: AuthenticatedUserIdentity;
  createEventAction?: (formData: FormData) => Promise<void>;
  duplicateEventAction?: (formData: FormData) => Promise<void>;
  deleteEventAction?: (formData: FormData) => Promise<void>;
};

type DateRangeFilterValue =
  | "all-dates"
  | "last-30-days"
  | "earlier-this-year"
  | "previous-years";

const TOKYO_TIME_ZONE = "Asia/Tokyo";
const MS_PER_DAY = 86_400_000;

function getTokyoCalendarParts(value: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: TOKYO_TIME_ZONE,
    year: "numeric",
  });
  const parts = formatter.formatToParts(value);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("failed to resolve Tokyo calendar parts");
  }

  return {
    dayNumber: Date.UTC(Number(year), Number(month) - 1, Number(day)),
    year: Number(year),
  };
}

function resolveTokyoDayDifference(currentDate: Date, eventDate: Date) {
  return Math.floor(
    (getTokyoCalendarParts(currentDate).dayNumber - getTokyoCalendarParts(eventDate).dayNumber) /
      MS_PER_DAY,
  );
}

function formatVenueLabel(venue: string | null) {
  return venue ?? "未設定";
}

function resolveVenueOptions(events: EventSummary[]) {
  const venueLabels = new Set<string>();

  for (const event of events) {
    venueLabels.add(formatVenueLabel(event.venue));
  }

  return Array.from(venueLabels)
    .sort((left, right) => left.localeCompare(right, "ja"))
    .map((venue) => ({
      label: venue,
      value: venue,
    }));
}

function matchesDateRange(
  eventDate: Date | null,
  dateRange: DateRangeFilterValue,
  currentDate: Date,
) {
  if (!eventDate || dateRange === "all-dates") {
    return true;
  }

  const eventTokyo = getTokyoCalendarParts(eventDate);
  const currentTokyo = getTokyoCalendarParts(currentDate);
  const dayDifference = resolveTokyoDayDifference(currentDate, eventDate);

  if (dateRange === "last-30-days") {
    return dayDifference >= 0 && dayDifference < 30;
  }

  if (dateRange === "earlier-this-year") {
    return eventTokyo.year === currentTokyo.year && dayDifference >= 30;
  }

  return eventTokyo.year < currentTokyo.year;
}

export function PerformanceArchivePageContent({
  events,
  currentTheme,
  currentPlan,
  userIdentity,
  createEventAction,
  duplicateEventAction,
  deleteEventAction,
}: PerformanceArchivePageContentProps) {
  const theme = getDashboardThemeStyles(currentTheme);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("all-venues");
  const [selectedEventTheme, setSelectedEventTheme] = useState("all-themes");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeFilterValue>("all-dates");
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const venueOptions = useMemo(() => resolveVenueOptions(events), [events]);
  const filteredEvents = useMemo(() => {
    const currentDate = new Date();

    return events.filter((event) => {
      const searchableFields = [event.title, event.venue].filter(
        (field): field is string => Boolean(field),
      );
      const searchMatch =
        normalizedSearchQuery.length === 0 ||
        searchableFields.some((field) =>
          field.toLowerCase().includes(normalizedSearchQuery),
        );
      const venueLabel = formatVenueLabel(event.venue);
      const venueMatch =
        selectedVenue === "all-venues" || venueLabel === selectedVenue;
      const eventThemeMatch =
        selectedEventTheme === "all-themes" || event.theme === selectedEventTheme;
      const dateRangeMatch = matchesDateRange(event.eventDate, selectedDateRange, currentDate);

      return searchMatch && venueMatch && eventThemeMatch && dateRangeMatch;
    });
  }, [events, normalizedSearchQuery, selectedDateRange, selectedEventTheme, selectedVenue]);
  const hasArchiveEvents = events.length > 0;
  const hasFilteredEvents = filteredEvents.length > 0;
  const isFiltering =
    normalizedSearchQuery.length > 0 ||
    selectedVenue !== "all-venues" ||
    selectedEventTheme !== "all-themes" ||
    selectedDateRange !== "all-dates";
  const totalArchiveCountLabel = `${events.length}公演`;
  const visibleArchiveCountLabel = `${filteredEvents.length}件表示`;
  const archiveModeLabel = currentPlan === "pro" ? "PRO ARCHIVE" : "FREE ARCHIVE";
  const lightHref = "/events?theme=light";
  const darkHref = "/events?theme=dark";
  const archiveDescription = isFiltering
    ? `保存済みの公演は${totalArchiveCountLabel}です。現在は検索結果として${filteredEvents.length}件を表示しています。`
    : `保存済みの公演を${totalArchiveCountLabel}表示しています。曲順編集が必要なときは各行から開けます。`;

  const sidebar = (
    <div className="space-y-3">
      <section className={`border ${theme.railBorder} ${theme.panelMuted} px-4 py-4`}>
        <p className={`font-mono text-[11px] uppercase tracking-[0.3em] ${theme.mutedText}`}>
          ARCHIVE STATUS
        </p>
        <p className={`mt-2 text-xs uppercase tracking-[0.24em] ${theme.mutedText}`}>
          {archiveModeLabel}
        </p>
        <p className={`mt-3 border-t border-dashed ${theme.railBorder} pt-3 text-2xl font-black`}>
          {totalArchiveCountLabel}
        </p>
        <p className={`mt-3 text-xs leading-6 ${theme.mutedText}`}>
          保存済み公演を一覧し、編集・複製・削除へすぐ移動できます。
        </p>
      </section>

      {createEventAction ? (
        <form action={createEventAction} className="contents">
          <input type="hidden" name="theme" value={currentTheme} />
          <FormPendingButton
            idleLabel="新規公演作成"
            pendingLabel="作成中..."
            className={`${theme.buttonPrimary} min-h-11 w-full px-4 py-3 text-sm font-black tracking-[0.14em] uppercase`}
          />
        </form>
      ) : null}
    </div>
  );

  return (
    <DashboardShell
      currentTheme={currentTheme}
      sidebar={sidebar}
      eyebrow="公演アーカイブ"
      title="公演アーカイブ"
      description={archiveDescription}
      globalNav={<AppGlobalNav activeItem="archive" ariaLabel="公演ナビゲーション" />}
      headerActions={
        <>
          <ThemeToggle currentTheme={currentTheme} lightHref={lightHref} darkHref={darkHref} />
          <UserMenu
            displayName={userIdentity.displayName}
            email={userIdentity.email}
            currentPlan={currentPlan}
          />
        </>
      }
    >
      <section className={`border ${theme.border} ${theme.panel} p-4 sm:p-5`}>
        <p className={`font-mono text-[11px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
          ARCHIVE OVERVIEW
        </p>
        <div className="mt-3 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className={`text-sm leading-6 ${theme.mutedText}`}>
                保存済み公演を、日付・会場・タイトル・更新日時で素早く確認できます。
              </p>
              <div className="text-right">
                <p className="font-mono text-3xl font-black tracking-[-0.08em]">
                  {isFiltering ? visibleArchiveCountLabel : totalArchiveCountLabel}
                </p>
                {isFiltering ? (
                  <p className={`mt-1 text-[10px] uppercase tracking-[0.26em] ${theme.mutedText}`}>
                    OF {totalArchiveCountLabel}
                  </p>
                ) : null}
              </div>
            </div>

            <label className="block">
              <span className="sr-only">Archive search</span>
              <input
                type="search"
                placeholder="ARCHIVE SEARCH..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                className={`w-full min-h-12 px-4 text-sm font-mono uppercase tracking-[0.18em] ${theme.input}`}
              />
            </label>
          </div>

          <div className={`border ${theme.border} ${theme.panelMuted} px-4 py-3`}>
            <p className={`font-mono text-[10px] uppercase tracking-[0.3em] ${theme.mutedText}`}>
              SYSTEM META
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.18em]">
              <div className={`border ${theme.border} px-3 py-2`}>
                <div className={theme.mutedText}>Archive Mode</div>
                <div className="mt-1 font-bold">{archiveModeLabel}</div>
              </div>
              <div className={`border ${theme.border} px-3 py-2`}>
                <div className={theme.mutedText}>Total Shows</div>
                <div className="mt-1 font-bold">{totalArchiveCountLabel}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PerformanceArchiveFilters
        currentTheme={currentTheme}
        dateRangeValue={selectedDateRange}
        eventThemeValue={selectedEventTheme}
        venueOptions={venueOptions}
        venueValue={selectedVenue}
        onDateRangeChange={(value) => setSelectedDateRange(value as DateRangeFilterValue)}
        onEventThemeChange={setSelectedEventTheme}
        onResetFilters={() => {
          setSearchQuery("");
          setSelectedVenue("all-venues");
          setSelectedEventTheme("all-themes");
          setSelectedDateRange("all-dates");
        }}
        onVenueChange={setSelectedVenue}
      />

      {!hasArchiveEvents ? (
        <section className={`border ${theme.border} ${theme.panel} p-6`}>
          <p className={`font-mono text-[11px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
            空のアーカイブ
          </p>
          <h2 className="mt-3 font-mono text-3xl font-black tracking-[-0.08em]">
            アーカイブにはまだ保存済みの公演がありません
          </h2>
          <p className={`mt-3 max-w-2xl text-sm leading-7 ${theme.mutedText}`}>
            検索とフィルタはこのまま表示され、最初の公演を作成するとここにアーカイブ一覧が並びます。
          </p>
        </section>
      ) : isFiltering && !hasFilteredEvents ? (
        <section className={`border ${theme.border} ${theme.panel} p-6`}>
          <p className={`font-mono text-[11px] uppercase tracking-[0.32em] ${theme.mutedText}`}>
            FILTERED ARCHIVE
          </p>
          <h2 className="mt-3 font-mono text-3xl font-black tracking-[-0.08em]">
            検索結果に一致する公演がありません
          </h2>
          <p className={`mt-3 max-w-2xl text-sm leading-7 ${theme.mutedText}`}>
            別のキーワードを試すか、RESET FILTERS で一覧に戻してください。
          </p>
        </section>
      ) : (
        <PerformanceArchiveTable
          events={filteredEvents}
          currentTheme={currentTheme}
          duplicateEventAction={duplicateEventAction}
          deleteEventAction={deleteEventAction}
        />
      )}
    </DashboardShell>
  );
}
