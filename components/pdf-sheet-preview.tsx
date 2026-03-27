import type { SetlistPdfLayout, SetlistPdfPageLayout, SetlistPdfRowLayout } from "@/lib/pdf/build-layout";
import type { EventWithItems } from "@/lib/repositories/event-repository";

type PdfSheetPreviewProps = {
  event: Pick<EventWithItems, "updatedAt">;
  layout: SetlistPdfLayout;
};

function formatUpdatedAt(value: Date | null | undefined) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(value);
}

function getSheetTone(layout: SetlistPdfLayout) {
  if (layout.theme.name === "dark") {
    return {
      canvas: "bg-[#111111]",
      sheet: "border border-[#4d4732]/60 bg-[#000000] text-[#fff6df] shadow-[0_30px_70px_rgba(0,0,0,0.45)]",
      divider: "border-[#f6c453]",
      subtleDivider: "border-[#f6c453]/25",
      headerTitle: "text-[#f6c453]",
      headerSubtitle: "text-[#fff6df]",
      cue: "text-[#f6c453]",
      muted: "text-[#f6c453]/65",
      rowFill: "bg-[#171717]",
      emphasisFill: "bg-[#f6c453]/10",
      headingBorder: "border-[#f6c453]",
      transitionText: "text-[#f6c453]",
    } as const;
  }

  return {
    canvas: "bg-[#111111]",
    sheet: "border border-[#d8d0c2] bg-[#fffdf8] text-[#1f1b16] shadow-[0_30px_70px_rgba(0,0,0,0.28)]",
    divider: "border-[#1f1b16]",
    subtleDivider: "border-[#d8d0c2]",
    headerTitle: "text-[#1f1b16]",
    headerSubtitle: "text-[#5f5649]",
    cue: "text-[#1f1b16]",
    muted: "text-[#7b7162]",
    rowFill: "bg-[#fffdf8]",
    emphasisFill: "bg-[#f3eee2]",
    headingBorder: "border-[#1f1b16]",
    transitionText: "text-[#1f1b16]",
  } as const;
}

function Row({
  row,
  tone,
}: {
  row: SetlistPdfRowLayout;
  tone: ReturnType<typeof getSheetTone>;
}) {
  if (row.variant === "mc") {
    return (
      <div className="flex items-center px-4 py-4">
        <div className="w-16 shrink-0" />
        <div className={`flex-1 text-center font-mono text-sm tracking-[0.55em] ${tone.muted}`}>
          {row.displayText}
        </div>
      </div>
    );
  }

  if (row.variant === "transition") {
    return (
      <div className={`${tone.emphasisFill} my-4 px-3 py-3`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 shrink-0 font-mono text-sm font-black ${tone.cue}`}>
            {row.cueLabel}
          </div>
          <div className={`h-px flex-1 border-t ${tone.subtleDivider}`} />
          <div className={`font-mono text-[11px] font-black uppercase tracking-[0.44em] ${tone.transitionText}`}>
            {row.displayText}
          </div>
          <div className={`h-px flex-1 border-t ${tone.subtleDivider}`} />
        </div>
      </div>
    );
  }

  if (row.variant === "heading") {
    const headingTitle = row.displayText === row.cueLabel ? null : row.displayText;

    return (
      <div className={`mt-6 flex items-start border-y py-5 ${tone.headingBorder}`}>
        <div className={`w-16 shrink-0 font-mono text-2xl font-black ${tone.cue}`}>
          {row.cueLabel}
        </div>
        {headingTitle ? (
          <div className="flex-1 text-[1.7rem] font-black uppercase tracking-[0.18em]">
            {headingTitle}
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-start border-b py-5 ${tone.subtleDivider} ${tone.rowFill}`}>
      <div className={`w-16 shrink-0 font-mono text-2xl font-bold ${tone.cue}`}>
        {row.cueLabel}
      </div>
      <div className="flex-1 text-[1.9rem] font-black leading-[1.05] tracking-[-0.04em]">
        {row.displayText}
      </div>
    </div>
  );
}

function SheetPage({
  event,
  layout,
  page,
}: {
  event: Pick<EventWithItems, "updatedAt">;
  layout: SetlistPdfLayout;
  page: SetlistPdfPageLayout;
}) {
  const tone = getSheetTone(layout);
  const updatedAt = formatUpdatedAt(event.updatedAt);

  return (
    <article
      className={`${tone.sheet} mx-auto w-full max-w-[595px] min-h-[842px] p-10 sm:p-12`}
      aria-label={`PDF preview page ${page.pageNumber}`}
    >
      <header className={`border-b-4 pb-5 ${tone.divider}`}>
        <h2 className={`font-mono text-[1.85rem] font-black uppercase tracking-[-0.06em] ${tone.headerTitle}`}>
          SETLIST_PRODUCTION_SHEET
        </h2>
        <p className={`mt-3 text-xl font-bold tracking-[-0.04em] ${tone.headerSubtitle}`}>
          {page.header.title}
        </p>
        {page.header.subtitle ? (
          <p className={`mt-2 text-sm leading-6 ${tone.muted}`}>{page.header.subtitle}</p>
        ) : null}
      </header>

      <div className="mt-8">
        {page.rows.map((row, index) => (
          <Row key={`${page.pageNumber}-${row.id}-${index}`} row={row} tone={tone} />
        ))}
      </div>

      <footer className={`mt-10 flex items-end justify-between border-t pt-4 ${tone.subtleDivider}`}>
        <div className={`font-mono text-[10px] leading-tight ${tone.muted}`}>
          {updatedAt ? (
            <>
              <div>UPDATED_AT: {updatedAt}</div>
              <div>EVENT PAGE: {page.pageNumber}</div>
            </>
          ) : (
            <div>EVENT PAGE: {page.pageNumber}</div>
          )}
        </div>
        <div className={`font-mono text-xs font-black tracking-[0.24em] ${tone.cue}`}>
          {page.footer.text}
        </div>
      </footer>
    </article>
  );
}

export function PdfSheetPreview({ event, layout }: PdfSheetPreviewProps) {
  const tone = getSheetTone(layout);

  return (
    <section
      aria-label="紙面プレビュー"
      className={`${tone.canvas} min-h-full overflow-y-auto px-6 py-8 sm:px-8`}
    >
      <div className="space-y-8">
        {layout.pages.map((page) => (
          <SheetPage key={page.pageNumber} event={event} layout={layout} page={page} />
        ))}
      </div>
    </section>
  );
}
