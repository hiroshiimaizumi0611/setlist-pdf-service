import Link from "next/link";
import type { SetlistPdfLayout } from "@/lib/pdf/build-layout";
import type { PdfOutputPresetId } from "@/lib/pdf/output-presets";
import type { AppPlan } from "@/lib/stripe/plans";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import type { EventWithItems } from "@/lib/repositories/event-repository";
import { PdfExportGateModal } from "./pdf-export-gate-modal";
import { PdfPresetSelector } from "./pdf-preset-selector";
import { PdfPreviewInspector } from "./pdf-preview-inspector";

type PdfPreviewPageProps = {
  event: EventWithItems;
  layout: SetlistPdfLayout;
  currentTheme: PdfThemeName;
  currentPlan: AppPlan;
  requestedPresetId: PdfOutputPresetId;
  activePresetId: PdfOutputPresetId;
  blockedPresetId?: PdfOutputPresetId | null;
  documentHref: string;
  downloadHref: string;
};

function formatPreviewSubtitle(event: EventWithItems) {
  const parts = [
    event.eventDate
      ? new Intl.DateTimeFormat("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: "Asia/Tokyo",
        }).format(event.eventDate)
      : null,
    event.venue,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join("  ") : "日付・会場未設定";
}

function buildPreviewDocumentHref({
  documentHref,
  currentTheme,
  requestedPresetId,
}: {
  documentHref: string;
  currentTheme: PdfThemeName;
  requestedPresetId: PdfOutputPresetId;
}) {
  const url = new URL(documentHref);
  url.searchParams.set("theme", currentTheme);
  url.searchParams.set("preset", requestedPresetId);
  return url.toString();
}

export function PdfPreviewPage({
  event,
  layout,
  currentTheme,
  currentPlan,
  requestedPresetId,
  activePresetId,
  blockedPresetId: _blockedPresetId,
  documentHref,
  downloadHref,
}: PdfPreviewPageProps) {
  void _blockedPresetId;
  const previewBaseHref = `/events/${event.id}/pdf`;
  const previewDocumentHref = buildPreviewDocumentHref({
    documentHref,
    currentTheme,
    requestedPresetId,
  });
  const lightHref = `${previewBaseHref}?theme=light&preset=${requestedPresetId}`;
  const darkHref = `${previewBaseHref}?theme=dark&preset=${requestedPresetId}`;

  return (
    <main className="min-h-screen bg-[#111111] text-[#f6f3ee]">
      <header className="border-b border-[#2f2a24] bg-[#0d0d0d]/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#8d8578]">
              PDF Preview
            </p>
            <div className="space-y-1">
              <h1 className="font-mono text-3xl font-black tracking-[-0.08em] sm:text-4xl">
                {event.title}
              </h1>
              <p className="text-sm text-[#bfb7aa]">{formatPreviewSubtitle(event)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="border border-[#38332b] bg-[#171717] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#bfb7aa]">
              {layout.pageCount} pages
            </span>
            <span className="border border-[#38332b] bg-[#171717] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#bfb7aa]">
              {layout.warnings.length} warnings
            </span>
            <Link
              href={`/events/${event.id}`}
              className="inline-flex min-h-11 items-center justify-center border border-[#38332b] bg-[#171717] px-4 text-sm font-black uppercase tracking-[0.14em] text-[#f6f3ee] transition hover:bg-[#222222]"
            >
              編集へ戻る
            </Link>
            <PdfExportGateModal
              currentTheme={currentTheme}
              currentPlan={currentPlan}
              activePresetId={activePresetId}
              downloadHref={downloadHref}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-[1600px] lg:grid-cols-[minmax(0,1fr)_320px]">
        <section
          aria-label="紙面プレビュー"
          className="min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(246,196,83,0.18),_transparent_35%),linear-gradient(180deg,_#101010_0%,_#050505_100%)] px-6 py-8 sm:px-8"
        >
          <div className="mx-auto flex max-w-[980px] flex-col gap-4">
            <div className="flex items-center justify-between gap-3 border border-[#2f2a24] bg-[#121212]/90 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#bfb7aa] shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur">
              <span>Live Document</span>
              <span className="text-[#f6c453]">{currentTheme} theme</span>
            </div>
            <PdfPresetSelector
              previewBaseHref={previewBaseHref}
              currentTheme={currentTheme}
              currentPlan={currentPlan}
              requestedPresetId={requestedPresetId}
              activePresetId={activePresetId}
            />
            <div className="overflow-hidden rounded-[28px] border border-[#2f2a24] bg-[#0b0b0b] shadow-[0_32px_90px_rgba(0,0,0,0.45)]">
              <iframe
                key={previewDocumentHref}
                title="紙面プレビュー"
                src={previewDocumentHref}
                className="h-[960px] w-full bg-white"
              />
            </div>
          </div>
        </section>
        <PdfPreviewInspector
          currentTheme={currentTheme}
          lightHref={lightHref}
          darkHref={darkHref}
          warnings={layout.warnings}
          updatedAt={event.updatedAt}
        />
      </div>
    </main>
  );
}
