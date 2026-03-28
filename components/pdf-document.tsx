import type { CSSProperties } from "react";
import type {
  SetlistPdfLayout,
  SetlistPdfPageLayout,
  SetlistPdfRowLayout,
} from "@/lib/pdf/build-layout";
import type { EventWithItems } from "@/lib/repositories/event-repository";

type PdfDocumentProps = {
  event: Pick<EventWithItems, "updatedAt">;
  layout: SetlistPdfLayout;
};

const DOCUMENT_STYLES = `
  :root {
    color-scheme: light;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
  }

  body {
    background: var(--document-canvas);
  }

  [data-pdf-document] {
    min-height: 100vh;
    padding: 24px 0 48px;
    background: var(--document-canvas);
    color: var(--document-text-primary);
    font-family: var(--font-geist-sans), "Hiragino Sans", "Noto Sans JP", sans-serif;
  }

  [data-pdf-page] {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto 20px;
    padding: 12mm;
    background: var(--document-page-background);
    box-shadow: 0 24px 70px rgba(15, 12, 9, 0.18);
    break-after: page;
    page-break-after: always;
  }

  [data-pdf-page]:last-child {
    break-after: auto;
    page-break-after: auto;
  }

  [data-pdf-header-band] {
    border-top: 6px solid var(--document-accent);
    border-bottom: 2px solid var(--document-border-strong);
    background: linear-gradient(
      135deg,
      var(--document-header-background) 0%,
      var(--document-header-background) 72%,
      var(--document-accent-wash) 100%
    );
  }

  [data-pdf-rows] {
    margin-top: 18px;
  }

  [data-pdf-row] {
    position: relative;
  }

  [data-row-variant="song"] {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 18px;
    align-items: stretch;
    margin-top: 8px;
    border-bottom: 1px solid var(--document-border-soft);
    background: linear-gradient(
      90deg,
      var(--document-header-background) 0,
      var(--document-header-background) 64px,
      transparent 64px,
      transparent 100%
    );
  }

  [data-row-variant="mc"] {
    margin: 16px 0;
    padding: 12px 0;
    text-align: center;
    color: var(--document-text-secondary);
    font-family: var(--font-geist-mono), "SFMono-Regular", "Roboto Mono", monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.45em;
    text-transform: uppercase;
  }

  [data-row-variant="transition"] {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 18px;
    align-items: center;
    margin: 18px 0;
    padding: 12px 0;
    background: var(--document-emphasis-fill);
  }

  [data-row-variant="heading"] {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 18px;
    align-items: start;
    margin: 26px 0 8px;
    padding: 18px 0;
    border-top: 2px solid var(--document-border-strong);
    border-bottom: 2px solid var(--document-border-strong);
  }

  [data-pdf-cue] {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: 10px 8px;
    color: var(--document-cue-text);
    font-family: var(--font-geist-mono), "SFMono-Regular", "Roboto Mono", monospace;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  [data-row-variant="song"] [data-pdf-cue] {
    font-size: 13px;
    background: var(--document-header-background);
  }

  [data-row-variant="transition"] [data-pdf-cue] {
    font-size: 13px;
  }

  [data-row-variant="heading"] [data-pdf-cue] {
    align-items: flex-start;
    justify-content: flex-start;
    padding-left: 0;
    font-size: 30px;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  [data-pdf-row-copy] {
    min-width: 0;
  }

  [data-row-variant="song"] [data-pdf-row-copy] {
    padding: 14px 0 14px;
    font-size: 31px;
    font-weight: 900;
    line-height: 1.03;
    letter-spacing: -0.06em;
  }

  [data-row-variant="transition"] [data-pdf-row-copy] {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--document-accent);
    font-family: var(--font-geist-mono), "SFMono-Regular", "Roboto Mono", monospace;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.34em;
    text-transform: uppercase;
  }

  [data-row-variant="transition"] [data-pdf-row-copy]::before,
  [data-row-variant="transition"] [data-pdf-row-copy]::after {
    content: "";
    flex: 1;
    border-top: 1px solid var(--document-border-soft);
  }

  [data-row-variant="heading"] [data-pdf-row-copy] {
    font-size: 26px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  [data-pdf-footer] {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-top: 24px;
    padding-top: 12px;
    border-top: 1px solid var(--document-border-soft);
  }

  [data-pdf-updated-at] {
    color: var(--document-text-secondary);
    font-family: var(--font-geist-mono), "SFMono-Regular", "Roboto Mono", monospace;
    font-size: 10px;
    line-height: 1.5;
    letter-spacing: 0.08em;
  }

  [data-pdf-page-number] {
    color: var(--document-cue-text);
    font-family: var(--font-geist-mono), "SFMono-Regular", "Roboto Mono", monospace;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.24em;
  }

  @page {
    size: A4 portrait;
    margin: 0;
  }

  @media print {
    body {
      background: transparent;
    }

    [data-pdf-document] {
      padding: 0;
    }

    [data-pdf-page] {
      margin: 0;
      box-shadow: none;
    }
  }
`;

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
    hour12: false,
    timeZone: "Asia/Tokyo",
  }).format(value);
}

function getDocumentVariables(layout: SetlistPdfLayout): CSSProperties {
  const shadowColor =
    layout.theme.name === "dark" ? "rgba(0, 0, 0, 0.44)" : "rgba(15, 12, 9, 0.18)";

  return {
    ["--document-canvas" as string]:
      layout.theme.name === "dark" ? "#0c0c0c" : "#e8dfd0",
    ["--document-page-background" as string]: layout.theme.pageBackground,
    ["--document-header-background" as string]: layout.theme.headerBackground,
    ["--document-text-primary" as string]: layout.theme.primaryText,
    ["--document-text-secondary" as string]: layout.theme.secondaryText,
    ["--document-accent" as string]: layout.theme.accentText,
    ["--document-accent-wash" as string]:
      layout.theme.name === "dark" ? "rgba(246, 196, 83, 0.12)" : "rgba(123, 93, 30, 0.10)",
    ["--document-border-soft" as string]: layout.theme.border,
    ["--document-border-strong" as string]:
      layout.theme.name === "dark" ? layout.theme.accentText : layout.theme.primaryText,
    ["--document-emphasis-fill" as string]: layout.theme.emphasisFill,
    ["--document-cue-text" as string]:
      layout.theme.name === "dark" ? layout.theme.accentText : layout.theme.primaryText,
    ["--document-shadow" as string]: shadowColor,
  };
}

function PdfRow({ row }: { row: SetlistPdfRowLayout }) {
  if (row.variant === "mc") {
    return (
      <div data-pdf-row data-row-variant="mc">
        <div data-pdf-row-copy>{row.displayText}</div>
      </div>
    );
  }

  if (row.variant === "transition") {
    return (
      <div data-pdf-row data-row-variant="transition">
        <div data-pdf-cue>{row.cueLabel}</div>
        <div data-pdf-row-copy>{row.displayText}</div>
      </div>
    );
  }

  if (row.variant === "heading") {
    const headingTitle = row.displayText === row.cueLabel ? null : row.displayText;

    return (
      <div data-pdf-row data-row-variant="heading">
        <div data-pdf-cue>{row.cueLabel}</div>
        <div data-pdf-row-copy>{headingTitle}</div>
      </div>
    );
  }

  return (
    <div data-pdf-row data-row-variant="song">
      <div data-pdf-cue>{row.cueLabel}</div>
      <div data-pdf-row-copy>{row.displayText}</div>
    </div>
  );
}

function PdfDocumentPage({
  event,
  page,
}: {
  event: Pick<EventWithItems, "updatedAt">;
  page: SetlistPdfPageLayout;
}) {
  const updatedAt = formatUpdatedAt(event.updatedAt);

  return (
    <article
      aria-label={`Setlist PDF page ${page.pageNumber}`}
      data-pdf-page
    >
      <header data-pdf-header-band style={{ padding: "16px 18px 18px" }}>
        <div
          style={{
            color: "var(--document-accent)",
            fontFamily:
              'var(--font-geist-mono), "SFMono-Regular", "Roboto Mono", monospace',
            fontSize: "29px",
            fontWeight: 900,
            letterSpacing: "-0.08em",
            textTransform: "uppercase",
          }}
        >
          SETLIST_PRODUCTION_SHEET
        </div>
        <div
          style={{
            marginTop: "10px",
            fontSize: "22px",
            fontWeight: 800,
            letterSpacing: "-0.04em",
          }}
        >
          {page.header.title}
        </div>
        {page.header.subtitle ? (
          <div
            style={{
              marginTop: "8px",
              color: "var(--document-text-secondary)",
              fontSize: "12px",
              lineHeight: 1.65,
            }}
          >
            {page.header.subtitle}
          </div>
        ) : null}
      </header>

      <div data-pdf-rows>
        {page.rows.map((row) => (
          <PdfRow key={row.id} row={row} />
        ))}
      </div>

      <footer data-pdf-footer>
        <div data-pdf-updated-at>
          {updatedAt ? <div>UPDATED_AT: {updatedAt}</div> : null}
          <div>EVENT PAGE: {page.pageNumber}</div>
        </div>
        <div data-pdf-page-number>{page.footer.text}</div>
      </footer>
    </article>
  );
}

export function PdfDocument({ event, layout }: PdfDocumentProps) {
  return (
    <main
      aria-label="Setlist PDF document"
      data-pdf-document
      data-theme={layout.theme.name}
      role="document"
      style={getDocumentVariables(layout)}
    >
      <style>{DOCUMENT_STYLES}</style>
      {layout.pages.map((page) => (
        <PdfDocumentPage
          key={page.pageNumber}
          event={event}
          page={page}
        />
      ))}
    </main>
  );
}
