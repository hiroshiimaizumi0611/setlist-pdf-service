import type { SetlistPdfLayout } from "@/lib/pdf/build-layout";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import type { EventWithItems } from "@/lib/repositories/event-repository";
import { getDashboardThemeStyles } from "./dashboard-shell";

type PdfPreviewPageProps = {
  event: EventWithItems;
  layout: SetlistPdfLayout;
  currentTheme: PdfThemeName;
  downloadHref: string;
};

function formatPreviewSubtitle(event: EventWithItems) {
  const parts = [
    event.venue,
    event.eventDate
      ? new Intl.DateTimeFormat("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: "Asia/Tokyo",
        }).format(event.eventDate)
      : null,
    event.notes,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" / ") : "日付・会場未設定";
}

export function PdfPreviewPage({
  event,
  layout,
  currentTheme,
  downloadHref,
}: PdfPreviewPageProps) {
  const theme = getDashboardThemeStyles(currentTheme);

  return (
    <main className={`${theme.page} min-h-screen px-4 py-5 sm:px-6 lg:px-8 lg:py-8`}>
      <section className="mx-auto max-w-7xl space-y-6">
        <header
          className={`flex flex-col gap-4 border-2 ${theme.border} ${theme.panel} p-6 lg:flex-row lg:items-end lg:justify-between`}
        >
          <div className="space-y-3">
            <p className={`font-mono text-xs font-semibold uppercase tracking-[0.32em] ${theme.mutedText}`}>
              PDF Preview
            </p>
            <h1 className="font-mono text-4xl font-black tracking-[-0.08em]">
              {event.title}
            </h1>
            <p className={`max-w-3xl text-sm leading-7 ${theme.mutedText}`}>
              {formatPreviewSubtitle(event)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`${theme.pill} px-3 py-1 text-xs font-medium uppercase tracking-[0.22em]`}>
              {layout.theme.name}
            </span>
            <span className={`${theme.pill} px-3 py-1 text-xs font-medium uppercase tracking-[0.22em]`}>
              {layout.pageCount} pages
            </span>
            <span className={`${theme.pill} px-3 py-1 text-xs font-medium uppercase tracking-[0.22em]`}>
              {layout.warnings.length} warnings
            </span>
            <a
              href={downloadHref}
              target="_blank"
              rel="noreferrer"
              className={`${theme.buttonPrimary} inline-flex min-h-11 items-center justify-center px-5 text-sm font-black tracking-[0.16em] uppercase`}
            >
              PDFをダウンロード
            </a>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className={`border-2 ${theme.border} ${theme.panel} p-6`}>
            <p className={`font-mono text-[11px] uppercase tracking-[0.3em] ${theme.mutedText}`}>
              Paper Preview
            </p>
            <h2 className="mt-3 font-mono text-2xl font-black tracking-[-0.06em]">
              紙面プレビューは次のタスクで実装
            </h2>
            <p className={`mt-3 max-w-2xl text-sm leading-7 ${theme.mutedText}`}>
              共有レイアウトモデルだけを先に受け取り、左カラムのシートスタックは後続の Task 4 で差し込みます。
            </p>

            <div className={`mt-6 border-2 ${theme.border} ${theme.panelMuted} p-5`}>
              <p className={`font-mono text-[11px] uppercase tracking-[0.28em] ${theme.mutedText}`}>
                Shared layout snapshot
              </p>
              <p className="mt-2 text-sm font-medium">
                {layout.pages.length} pages / {layout.warnings.length} warnings
              </p>
              <p className={`mt-2 text-xs leading-6 ${theme.mutedText}`}>
                preview shell receives the exact model used by the PDF renderer.
              </p>
            </div>
          </section>

          <aside className={`border-2 ${theme.border} ${theme.panelMuted} p-6`}>
            <p className={`font-mono text-[11px] uppercase tracking-[0.3em] ${theme.mutedText}`}>
              Inspector
            </p>
            <h2 className="mt-3 font-mono text-2xl font-black tracking-[-0.06em]">
              右パネルは後続タスクで展開
            </h2>
            <p className={`mt-3 text-sm leading-7 ${theme.mutedText}`}>
              この段階では構造だけを置き、テーマ切替と警告表示の実装は次の Task 4 へ委ねます。
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
