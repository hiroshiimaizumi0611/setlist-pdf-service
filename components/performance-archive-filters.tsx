import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";

type PerformanceArchiveFiltersProps = {
  currentTheme: PdfThemeName;
  dateRangeValue: string;
  eventThemeValue: string;
  venueOptions: Array<{
    label: string;
    value: string;
  }>;
  venueValue: string;
  onDateRangeChange: (value: string) => void;
  onEventThemeChange: (value: string) => void;
  onResetFilters: () => void;
  onVenueChange: (value: string) => void;
};

export function PerformanceArchiveFilters({
  currentTheme,
  dateRangeValue,
  eventThemeValue,
  venueOptions,
  venueValue,
  onDateRangeChange,
  onEventThemeChange,
  onResetFilters,
  onVenueChange,
}: PerformanceArchiveFiltersProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  return (
    <section className={`border ${theme.border} ${theme.panel} p-4 sm:p-5`}>
      <p className={`mb-4 text-xs leading-6 ${theme.mutedText}`}>
        検索で一覧を絞り込み、RESET FILTERS で元に戻せます。
      </p>
      <form className="grid gap-4 xl:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
        <label className="flex min-w-0 flex-col gap-2">
          <span className={`font-mono text-[11px] uppercase tracking-[0.28em] ${theme.mutedText}`}>
            Date Range
          </span>
          <select
            value={dateRangeValue}
            onChange={(event) => onDateRangeChange(event.currentTarget.value)}
            className={`min-h-12 px-4 text-sm font-mono uppercase tracking-[0.14em] ${theme.input}`}
          >
            <option value="all-dates">All Dates</option>
            <option value="last-30-days">Last 30 Days</option>
            <option value="earlier-this-year">Earlier This Year</option>
            <option value="previous-years">Previous Years</option>
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-2">
          <span className={`font-mono text-[11px] uppercase tracking-[0.28em] ${theme.mutedText}`}>
            Venue
          </span>
          <select
            value={venueValue}
            onChange={(event) => onVenueChange(event.currentTarget.value)}
            className={`min-h-12 px-4 text-sm font-mono uppercase tracking-[0.14em] ${theme.input}`}
          >
            <option value="all-venues">All Venues</option>
            {venueOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-2">
          <span className={`font-mono text-[11px] uppercase tracking-[0.28em] ${theme.mutedText}`}>
            Event Theme
          </span>
          <select
            value={eventThemeValue}
            onChange={(event) => onEventThemeChange(event.currentTarget.value)}
            className={`min-h-12 px-4 text-sm font-mono uppercase tracking-[0.14em] ${theme.input}`}
          >
            <option value="all-themes">All Themes</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>

        <button
          type="button"
          onClick={onResetFilters}
          className={`${theme.buttonSecondary} min-h-12 px-5 text-xs font-black tracking-[0.18em] uppercase`}
        >
          RESET FILTERS
        </button>
      </form>
    </section>
  );
}
