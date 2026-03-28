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

type DensityMetrics = {
  headerBorderTop: string;
  headerBandPadding: string;
  kickerSize: string;
  titleSize: string;
  metaSize: string;
  cuePadding: string;
  cueFontSize: string;
  songFontSize: string;
  transitionFontSize: string;
  headingCueSize: string;
  headingTitleSize: string;
  rowCopyPadding: string;
  footerTopPadding: string;
  footerMetaSize: string;
  footerPageSize: string;
};

function scaleDensityMetric(value: number, factor: number) {
  return `${Number((value * factor).toFixed(2))}px`;
}

const A4_PAGE_SIZE_MM = {
  width: 210,
  height: 297,
} as const;

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
    position: relative;
    margin: 0 auto 20px;
    background: var(--document-page-background);
    box-shadow: 0 24px 70px var(--document-shadow);
    break-after: page;
    page-break-after: always;
    overflow: hidden;
  }

  [data-pdf-page]:last-child {
    break-after: auto;
    page-break-after: auto;
  }

  [data-pdf-header-band] {
    position: absolute;
    border-top: var(--document-header-border-top) solid var(--document-accent);
    border-bottom: 1px solid var(--document-border-strong);
    background: linear-gradient(
      135deg,
      var(--document-header-background) 0%,
      var(--document-header-background) 68%,
      var(--document-accent-wash) 100%
    );
  }

  [data-pdf-row] {
    position: absolute;
    overflow: hidden;
  }

  [data-row-variant="song"] {
    display: grid;
    gap: 0;
    align-items: stretch;
    border-bottom: 1px solid var(--document-border-soft);
    background: linear-gradient(
      90deg,
      var(--document-header-background) 0,
      var(--document-header-background) var(--document-cue-width),
      transparent var(--document-cue-width),
      transparent 100%
    );
  }

  [data-row-variant="mc"] {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--document-text-secondary);
    font-family: var(--font-geist-mono), "SFMono-Regular", "Roboto Mono", monospace;
    font-size: var(--document-transition-font-size);
    font-weight: 700;
    letter-spacing: 0.42em;
    text-transform: uppercase;
  }

  [data-row-variant="transition"] {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--document-emphasis-fill);
    border-top: 1px solid var(--document-border-soft);
    border-bottom: 1px solid var(--document-border-soft);
  }

  [data-row-variant="heading"] {
    display: grid;
    gap: 0;
    align-items: start;
    border-top: 1px solid var(--document-border-strong);
    border-bottom: 1px solid var(--document-border-strong);
  }

  [data-pdf-cue] {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: var(--document-cue-padding);
    color: var(--document-cue-text);
    font-family: var(--font-geist-mono), "SFMono-Regular", "Roboto Mono", monospace;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  [data-row-variant="song"] [data-pdf-cue] {
    justify-content: center;
    font-size: var(--document-cue-font-size);
  }

  [data-row-variant="transition"] [data-pdf-cue] {
    position: absolute;
    inset: 0 auto 0 0;
    width: var(--document-cue-width);
    justify-content: center;
    font-size: var(--document-cue-font-size);
    opacity: 0.92;
    z-index: 1;
  }

  [data-row-variant="heading"] [data-pdf-cue] {
    align-items: flex-start;
    justify-content: flex-start;
    padding-left: 4px;
    font-size: var(--document-heading-cue-size);
    line-height: 1;
    letter-spacing: -0.04em;
  }

  [data-pdf-row-copy] {
    min-width: 0;
    display: flex;
    align-items: center;
  }

  [data-row-variant="song"] [data-pdf-row-copy] {
    padding: 0 var(--document-row-copy-padding);
    font-size: var(--document-song-font-size);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.06em;
  }

  [data-row-variant="transition"] [data-pdf-row-copy] {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: var(--document-transition-gap);
    padding: 0 calc(var(--document-cue-width) + var(--document-row-copy-padding));
    color: var(--document-accent);
    font-family: var(--font-geist-mono), "SFMono-Regular", "Roboto Mono", monospace;
    font-size: var(--document-transition-font-size);
    font-weight: 800;
    letter-spacing: 0.24em;
    text-transform: uppercase;
  }

  [data-row-variant="transition"] [data-pdf-row-copy]::before,
  [data-row-variant="transition"] [data-pdf-row-copy]::after {
    content: "";
    flex: 1;
    border-top: 1px solid var(--document-border-soft);
  }

  [data-row-variant="heading"] [data-pdf-row-copy] {
    padding: 0 0 0 var(--document-row-copy-padding);
    font-size: var(--document-heading-title-size);
    font-weight: 900;
    line-height: 1;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  [data-pdf-footer] {
    position: absolute;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    padding-top: var(--document-footer-padding-top);
    border-top: 1px solid var(--document-border-soft);
  }

  [data-pdf-updated-at] {
    color: var(--document-text-secondary);
    font-family: var(--font-geist-mono), "SFMono-Regular", "Roboto Mono", monospace;
    font-size: var(--document-footer-meta-size);
    line-height: 1.5;
    letter-spacing: 0.08em;
  }

  [data-pdf-page-number] {
    color: var(--document-cue-text);
    font-family: var(--font-geist-mono), "SFMono-Regular", "Roboto Mono", monospace;
    font-size: var(--document-footer-page-size);
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

function getDensityMetrics(
  densityPreset: SetlistPdfLayout["densityPreset"],
  rowExpansion: number,
): DensityMetrics {
  const typographyScale = Math.min(1.48, 1 + (Math.max(1, rowExpansion) - 1) * 0.28);

  switch (densityPreset) {
    case "relaxed":
      return {
        headerBorderTop: scaleDensityMetric(4, Math.min(1.18, typographyScale)),
        headerBandPadding: `${scaleDensityMetric(14, typographyScale)} ${scaleDensityMetric(18, typographyScale)} ${scaleDensityMetric(16, typographyScale)}`,
        kickerSize: scaleDensityMetric(21, typographyScale),
        titleSize: scaleDensityMetric(19, typographyScale),
        metaSize: scaleDensityMetric(10.5, Math.min(1.18, typographyScale)),
        cuePadding: `${scaleDensityMetric(10, typographyScale)} ${scaleDensityMetric(8, typographyScale)}`,
        cueFontSize: scaleDensityMetric(11.5, typographyScale),
        songFontSize: scaleDensityMetric(17, typographyScale),
        transitionFontSize: scaleDensityMetric(11.5, typographyScale),
        headingCueSize: scaleDensityMetric(22, typographyScale),
        headingTitleSize: scaleDensityMetric(21, typographyScale),
        rowCopyPadding: scaleDensityMetric(14, typographyScale),
        footerTopPadding: scaleDensityMetric(7, Math.min(1.15, typographyScale)),
        footerMetaSize: scaleDensityMetric(10, Math.min(1.15, typographyScale)),
        footerPageSize: scaleDensityMetric(12, Math.min(1.12, typographyScale)),
      };
    case "compact":
      return {
        headerBorderTop: scaleDensityMetric(3, Math.min(1.08, typographyScale)),
        headerBandPadding: `${scaleDensityMetric(10, typographyScale)} ${scaleDensityMetric(14, typographyScale)} ${scaleDensityMetric(12, typographyScale)}`,
        kickerSize: scaleDensityMetric(18, typographyScale),
        titleSize: scaleDensityMetric(16, typographyScale),
        metaSize: scaleDensityMetric(9, Math.min(1.14, typographyScale)),
        cuePadding: `${scaleDensityMetric(7, typographyScale)} ${scaleDensityMetric(6, typographyScale)}`,
        cueFontSize: scaleDensityMetric(10, typographyScale),
        songFontSize: scaleDensityMetric(13, typographyScale),
        transitionFontSize: scaleDensityMetric(10, typographyScale),
        headingCueSize: scaleDensityMetric(18, typographyScale),
        headingTitleSize: scaleDensityMetric(18, typographyScale),
        rowCopyPadding: scaleDensityMetric(10, typographyScale),
        footerTopPadding: scaleDensityMetric(5, Math.min(1.1, typographyScale)),
        footerMetaSize: scaleDensityMetric(9, Math.min(1.1, typographyScale)),
        footerPageSize: scaleDensityMetric(11, Math.min(1.08, typographyScale)),
      };
    case "standard":
    default:
      return {
        headerBorderTop: scaleDensityMetric(4, Math.min(1.14, typographyScale)),
        headerBandPadding: `${scaleDensityMetric(12, typographyScale)} ${scaleDensityMetric(16, typographyScale)} ${scaleDensityMetric(14, typographyScale)}`,
        kickerSize: scaleDensityMetric(20, typographyScale),
        titleSize: scaleDensityMetric(18, typographyScale),
        metaSize: scaleDensityMetric(10, Math.min(1.16, typographyScale)),
        cuePadding: `${scaleDensityMetric(8, typographyScale)} ${scaleDensityMetric(7, typographyScale)}`,
        cueFontSize: scaleDensityMetric(11, typographyScale),
        songFontSize: scaleDensityMetric(15, typographyScale),
        transitionFontSize: scaleDensityMetric(11, typographyScale),
        headingCueSize: scaleDensityMetric(20, typographyScale),
        headingTitleSize: scaleDensityMetric(20, typographyScale),
        rowCopyPadding: scaleDensityMetric(12, typographyScale),
        footerTopPadding: scaleDensityMetric(6, Math.min(1.12, typographyScale)),
        footerMetaSize: scaleDensityMetric(10, Math.min(1.12, typographyScale)),
        footerPageSize: scaleDensityMetric(12, Math.min(1.1, typographyScale)),
      };
  }
}

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
  const cueWidth = scaleX(layout, layout.content.labelWidth);
  const densityMetrics = getDensityMetrics(
    layout.densityPreset,
    layout.pageGeometry.rowExpansion,
  );

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
    ["--document-cue-width" as string]: cueWidth,
    ["--document-shadow" as string]: shadowColor,
    ["--document-header-border-top" as string]: densityMetrics.headerBorderTop,
    ["--document-header-padding" as string]: densityMetrics.headerBandPadding,
    ["--document-kicker-size" as string]: densityMetrics.kickerSize,
    ["--document-title-size" as string]: densityMetrics.titleSize,
    ["--document-meta-size" as string]: densityMetrics.metaSize,
    ["--document-cue-padding" as string]: densityMetrics.cuePadding,
    ["--document-cue-font-size" as string]: densityMetrics.cueFontSize,
    ["--document-song-font-size" as string]: densityMetrics.songFontSize,
    ["--document-transition-font-size" as string]: densityMetrics.transitionFontSize,
    ["--document-heading-cue-size" as string]: densityMetrics.headingCueSize,
    ["--document-heading-title-size" as string]: densityMetrics.headingTitleSize,
    ["--document-row-copy-padding" as string]: densityMetrics.rowCopyPadding,
    ["--document-transition-gap" as string]:
      layout.densityPreset === "compact"
        ? scaleDensityMetric(6, Math.min(1.08, layout.pageGeometry.rowExpansion))
        : scaleDensityMetric(8, Math.min(1.16, layout.pageGeometry.rowExpansion)),
    ["--document-footer-padding-top" as string]: densityMetrics.footerTopPadding,
    ["--document-footer-meta-size" as string]: densityMetrics.footerMetaSize,
    ["--document-footer-page-size" as string]: densityMetrics.footerPageSize,
  };
}

function scaleX(layout: SetlistPdfLayout, value: number) {
  return `${Number(((value / layout.pageSize.width) * A4_PAGE_SIZE_MM.width).toFixed(3))}mm`;
}

function scaleY(layout: SetlistPdfLayout, value: number) {
  return `${Number(((value / layout.pageSize.height) * A4_PAGE_SIZE_MM.height).toFixed(3))}mm`;
}

function PdfRow({
  layout,
  row,
}: {
  layout: SetlistPdfLayout;
  row: SetlistPdfRowLayout;
}) {
  const cueWidth = scaleX(layout, layout.content.labelWidth);
  const rowStyle = {
    left: scaleX(layout, layout.content.left),
    top: scaleY(layout, row.top),
    width: scaleX(layout, layout.content.width),
    height: scaleY(layout, row.height),
    gridTemplateColumns: `${cueWidth} minmax(0, 1fr)`,
  } satisfies CSSProperties;

  if (row.variant === "mc") {
    return (
      <div
        data-centering-family="callout"
        data-density-preset={layout.densityPreset}
        data-pdf-row
        data-row-height={row.height}
        data-row-top={row.top}
        data-row-variant="mc"
        style={rowStyle}
      >
        <div data-pdf-row-copy>{row.displayText}</div>
      </div>
    );
  }

  if (row.variant === "transition") {
    return (
      <div
        data-centering-family="callout"
        data-density-preset={layout.densityPreset}
        data-pdf-row
        data-row-height={row.height}
        data-row-top={row.top}
        data-row-variant="transition"
        style={rowStyle}
      >
        <div data-pdf-cue>{row.cueLabel}</div>
        <div data-pdf-row-copy>{row.displayText}</div>
      </div>
    );
  }

  if (row.variant === "heading") {
    const headingTitle = row.displayText === row.cueLabel ? null : row.displayText;

    return (
      <div
        data-density-preset={layout.densityPreset}
        data-pdf-row
        data-row-height={row.height}
        data-row-top={row.top}
        data-row-variant="heading"
        data-title-treatment="heading"
        style={rowStyle}
      >
        <div data-pdf-cue>{row.cueLabel}</div>
        <div data-pdf-row-copy>{headingTitle}</div>
      </div>
    );
  }

  return (
    <div
      data-density-preset={layout.densityPreset}
      data-pdf-row
      data-row-height={row.height}
      data-row-top={row.top}
      data-row-variant="song"
      data-title-treatment="song"
      style={rowStyle}
    >
      <div data-pdf-cue>{row.cueLabel}</div>
      <div data-pdf-row-copy>{row.displayText}</div>
    </div>
  );
}

function PdfDocumentPage({
  event,
  layout,
  page,
}: {
  event: Pick<EventWithItems, "updatedAt">;
  layout: SetlistPdfLayout;
  page: SetlistPdfPageLayout;
}) {
  const updatedAt = formatUpdatedAt(event.updatedAt);
  const pageStyle = {
    width: `${A4_PAGE_SIZE_MM.width}mm`,
    height: `${A4_PAGE_SIZE_MM.height}mm`,
  } satisfies CSSProperties;
  const headerStyle = {
    left: scaleX(layout, layout.margins.left),
    top: scaleY(layout, page.header.top),
    width: scaleX(layout, layout.content.width),
    height: scaleY(layout, page.header.height),
    padding: "var(--document-header-padding)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  } satisfies CSSProperties;
  const footerStyle = {
    left: scaleX(layout, layout.content.left),
    top: scaleY(layout, page.footer.top),
    width: scaleX(layout, layout.content.width),
  } satisfies CSSProperties;

  return (
    <article
      aria-label={`Setlist PDF page ${page.pageNumber}`}
      data-pdf-page
      style={pageStyle}
    >
      <header data-pdf-header-band style={headerStyle}>
        <div
          style={{
            color: "var(--document-accent)",
            fontFamily:
              'var(--font-geist-mono), "SFMono-Regular", "Roboto Mono", monospace',
            fontSize: "var(--document-kicker-size)",
            fontWeight: 900,
            letterSpacing: "-0.08em",
            textTransform: "uppercase",
          }}
        >
          SETLIST_PRODUCTION_SHEET
        </div>
        <div
          style={{
            marginTop: "6px",
            fontSize: "var(--document-title-size)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
          }}
        >
          {page.header.title}
        </div>
        {page.header.subtitle ? (
          <div
            style={{
              marginTop: "4px",
              color: "var(--document-text-secondary)",
              fontSize: "var(--document-meta-size)",
              lineHeight: 1.35,
            }}
          >
            {page.header.subtitle}
          </div>
        ) : null}
      </header>

      {page.rows.map((row) => (
        <PdfRow key={row.id} layout={layout} row={row} />
      ))}

      <footer data-pdf-footer style={footerStyle}>
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
      data-density-preset={layout.densityPreset}
      data-theme={layout.theme.name}
      role="document"
      style={getDocumentVariables(layout)}
    >
      <style>{DOCUMENT_STYLES}</style>
      {layout.pages.map((page) => (
        <PdfDocumentPage
          key={page.pageNumber}
          event={event}
          layout={layout}
          page={page}
        />
      ))}
    </main>
  );
}
