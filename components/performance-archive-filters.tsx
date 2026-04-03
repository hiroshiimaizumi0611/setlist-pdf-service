import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getDashboardThemeStyles } from "./dashboard-shell";

type PerformanceArchiveFiltersProps = {
  currentTheme: PdfThemeName;
};

export function PerformanceArchiveFilters({
  currentTheme,
}: PerformanceArchiveFiltersProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  return (
    <section className={`border ${theme.border} ${theme.panel} p-4 sm:p-5`}>
      <p className={`mb-4 text-xs leading-6 ${theme.mutedText}`}>
        検索とフィルタは準備中です。
      </p>
      <form className="grid gap-4 xl:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
        <label className="flex min-w-0 flex-col gap-2">
          <span className={`font-mono text-[11px] uppercase tracking-[0.28em] ${theme.mutedText}`}>
            Date Range
          </span>
          <select
            defaultValue="all-dates"
            disabled
            className={`min-h-12 px-4 text-sm font-mono uppercase tracking-[0.14em] ${theme.inputMuted}`}
          >
            <option value="all-dates">All Dates</option>
            <option value="recent">Recent Shows</option>
            <option value="this-month">This Month</option>
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-2">
          <span className={`font-mono text-[11px] uppercase tracking-[0.28em] ${theme.mutedText}`}>
            Venue
          </span>
          <select
            defaultValue="all-venues"
            disabled
            className={`min-h-12 px-4 text-sm font-mono uppercase tracking-[0.14em] ${theme.inputMuted}`}
          >
            <option value="all-venues">All Venues</option>
            <option value="club">Club / Live House</option>
            <option value="hall">Hall</option>
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-2">
          <span className={`font-mono text-[11px] uppercase tracking-[0.28em] ${theme.mutedText}`}>
            Theme
          </span>
          <select
            defaultValue="all-themes"
            disabled
            className={`min-h-12 px-4 text-sm font-mono uppercase tracking-[0.14em] ${theme.inputMuted}`}
          >
            <option value="all-themes">All Themes</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>

        <button
          type="reset"
          disabled
          className={`${theme.buttonSecondary} min-h-12 px-5 text-xs font-black tracking-[0.18em] uppercase`}
        >
          RESET FILTERS
        </button>
      </form>
    </section>
  );
}
