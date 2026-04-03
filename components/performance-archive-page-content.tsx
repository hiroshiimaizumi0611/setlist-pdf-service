import type { EventSummary } from "@/lib/repositories/event-repository";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import type { AppPlan } from "@/lib/stripe/plans";
import { DashboardShell, getDashboardThemeStyles } from "./dashboard-shell";
import { FormPendingButton } from "./form-pending-button";
import { PerformanceArchiveFilters } from "./performance-archive-filters";
import { PerformanceArchiveTable } from "./performance-archive-table";
import { ThemeToggle } from "./theme-toggle";

type PerformanceArchivePageContentProps = {
  events: EventSummary[];
  currentTheme: PdfThemeName;
  currentPlan: AppPlan;
  createEventAction?: (formData: FormData) => Promise<void>;
  duplicateEventAction?: (formData: FormData) => Promise<void>;
  deleteEventAction?: (formData: FormData) => Promise<void>;
};

export function PerformanceArchivePageContent({
  events,
  currentTheme,
  currentPlan,
  createEventAction,
  duplicateEventAction,
  deleteEventAction,
}: PerformanceArchivePageContentProps) {
  const theme = getDashboardThemeStyles(currentTheme);
  const archiveCountLabel = `${events.length}公演`;
  const archiveModeLabel = currentPlan === "pro" ? "PRO ARCHIVE" : "FREE ARCHIVE";
  const lightHref = "/events?theme=light";
  const darkHref = "/events?theme=dark";

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
          {archiveCountLabel}
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
      description={`保存済みの公演を${archiveCountLabel}表示しています。曲順編集が必要なときは各行から開けます。`}
      headerActions={
        <ThemeToggle currentTheme={currentTheme} lightHref={lightHref} darkHref={darkHref} />
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
              <p className="font-mono text-3xl font-black tracking-[-0.08em]">{archiveCountLabel}</p>
            </div>

            <label className="block">
              <span className="sr-only">Archive search</span>
              <input
                type="search"
                placeholder="ARCHIVE SEARCH..."
                disabled
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
                <div className="mt-1 font-bold">{archiveCountLabel}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PerformanceArchiveFilters currentTheme={currentTheme} />

      {events.length === 0 ? (
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
      ) : (
        <PerformanceArchiveTable
          events={events}
          currentTheme={currentTheme}
          duplicateEventAction={duplicateEventAction}
          deleteEventAction={deleteEventAction}
        />
      )}
    </DashboardShell>
  );
}
