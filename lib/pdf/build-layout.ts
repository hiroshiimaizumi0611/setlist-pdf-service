import { buildRenderableItems } from "../setlist/build-renderable-items";
import type { EventWithItems } from "../repositories/event-repository";
import { getPdfThemeTokens, type PdfThemeName, type PdfThemeTokens } from "./theme-tokens";
import { formatEventDateForDisplay } from "./format-event-date";
import {
  DENSITY_PRESETS,
  getDensityPreset,
  getRowDensityWeight,
  getSinglePageExpansionConfig,
  type SetlistPdfDensityPreset,
  type SetlistPdfRowType,
} from "./density-presets";

const PAGE_SIZE = {
  width: 540,
  height: 780,
} as const;

const MARGINS = {
  top: 36,
  right: 36,
  bottom: 36,
  left: 36,
} as const;

const HEADER_HEIGHT = 88;
const FOOTER_HEIGHT = 18;
const LABEL_COLUMN_WIDTH = 44;
const SONG_CUE_PREFIX = "M";
const SONG_TITLE_LIMIT = 24;
const HEADING_TITLE_LIMIT = 20;
const TRANSITION_TITLE_LIMIT = 18;

type RenderableRow = ReturnType<typeof buildRenderableItems<EventWithItems["items"][number]>>[number];

export type SetlistPdfLayoutInput = {
  event: Pick<EventWithItems, "title" | "venue" | "eventDate" | "notes" | "items">;
  theme?: PdfThemeName;
};

export type SetlistPdfWarning = {
  type: "long-title";
  rowId: string;
  rowVariant: RenderableRow["itemType"];
  originalTitle: string;
  displayText: string;
  message: string;
};

export type SetlistPdfRowLayout = {
  id: string;
  itemType: RenderableRow["itemType"];
  variant: RenderableRow["itemType"];
  label: string | null;
  cueLabel: string | null;
  title: string;
  displayText: string;
  top: number;
  height: number;
};

export type SetlistPdfPageLayout = {
  pageNumber: number;
  header: {
    title: string;
    subtitle: string | null;
    top: number;
    height: number;
  };
  footer: {
    text: string;
    top: number;
  };
  rows: SetlistPdfRowLayout[];
};

export type SetlistPdfPageGeometry = {
  contentTop: number;
  contentBottom: number;
  maxRowsHeight: number;
  rowGap: number;
  rowHeights: Record<SetlistPdfRowType, number>;
  effectiveRowDensity: number;
  rowExpansion: number;
  topOffset: number;
};

export type SetlistPdfLayout = {
  pageSize: typeof PAGE_SIZE;
  margins: typeof MARGINS;
  content: {
    left: number;
    right: number;
    top: number;
    width: number;
    labelWidth: number;
  };
  theme: PdfThemeTokens;
  densityPreset: SetlistPdfDensityPreset;
  pageGeometry: SetlistPdfPageGeometry;
  pageCount: number;
  warnings: SetlistPdfWarning[];
  pages: SetlistPdfPageLayout[];
};

function getTitleLimit(itemType: RenderableRow["itemType"]) {
  switch (itemType) {
    case "heading":
      return HEADING_TITLE_LIMIT;
    case "transition":
      return TRANSITION_TITLE_LIMIT;
    default:
      return SONG_TITLE_LIMIT;
  }
}

function truncateTitle(title: string, limit: number) {
  if (title.length <= limit) {
    return title;
  }

  return `${title.slice(0, Math.max(0, limit - 1))}…`;
}

function getCueLabel(
  row: RenderableRow,
  songIndex: number,
): string | null {
  switch (row.itemType) {
    case "song":
      return `${SONG_CUE_PREFIX}${String(songIndex).padStart(2, "0")}`;
    case "transition":
      return "--";
    case "heading":
      return row.title;
    case "mc":
      return null;
    default:
      return null;
  }
}

function getDisplayText(row: RenderableRow) {
  if (row.itemType === "mc") {
    return "[ MC ]";
  }

  const limit = getTitleLimit(row.itemType);
  return truncateTitle(row.title, limit);
}

function buildSubtitle(event: SetlistPdfLayoutInput["event"]) {
  const parts = [
    formatEventDateForDisplay(event.eventDate),
    event.venue,
    event.notes,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join("  •  ") : null;
}

function getUsedHeight(rows: SetlistPdfRowLayout[], rowGap: number) {
  if (rows.length === 0) {
    return 0;
  }

  return rows.reduce(
    (total, row, index) => total + row.height + (index === 0 ? 0 : rowGap),
    0,
  );
}

function buildPagesForGeometry(input: {
  event: SetlistPdfLayoutInput["event"];
  renderableRows: RenderableRow[];
  contentTop: number;
  maxRowsHeight: number;
  rowGap: number;
  rowHeights: Record<SetlistPdfRowType, number>;
  topOffset?: number;
}) {
  const pages: Omit<SetlistPdfPageLayout, "pageNumber" | "footer">[] = [];
  const warnings: SetlistPdfWarning[] = [];

  let currentRows: SetlistPdfPageLayout["rows"] = [];
  let currentTop = input.contentTop + (input.topOffset ?? 0);
  let usedHeight = 0;
  let songCount = 1;

  for (const row of input.renderableRows) {
    const rowHeight = input.rowHeights[row.itemType as SetlistPdfRowType];
    const nextHeight =
      currentRows.length === 0 ? rowHeight : usedHeight + input.rowGap + rowHeight;
    const cueLabel = getCueLabel(row, songCount);
    const displayText = getDisplayText(row);
    const titleLimit = getTitleLimit(row.itemType);
    const shouldWarn = row.itemType !== "mc" && row.title.length > titleLimit;

    if (row.itemType === "song") {
      songCount += 1;
    }

    if (currentRows.length > 0 && nextHeight > input.maxRowsHeight) {
      pages.push({
        header: {
          title: input.event.title,
          subtitle: buildSubtitle(input.event),
          top: MARGINS.top,
          height: HEADER_HEIGHT,
        },
        rows: currentRows,
      });
      currentRows = [];
      currentTop = input.contentTop;
      usedHeight = 0;
    }

    currentRows.push({
      id: row.id,
      itemType: row.itemType,
      variant: row.itemType,
      label: cueLabel,
      cueLabel,
      title: row.title,
      displayText,
      top: currentTop,
      height: rowHeight,
    });

    if (shouldWarn) {
      warnings.push({
        type: "long-title",
        rowId: row.id,
        rowVariant: row.itemType,
        originalTitle: row.title,
        displayText,
        message: `Title for ${row.itemType} ${row.id} was truncated for the shared PDF layout.`,
      });
    }

    usedHeight =
      currentRows.length === 1 ? rowHeight : usedHeight + input.rowGap + rowHeight;
    currentTop += rowHeight + input.rowGap;
  }

  if (currentRows.length > 0 || pages.length === 0) {
    pages.push({
      header: {
        title: input.event.title,
        subtitle: buildSubtitle(input.event),
        top: MARGINS.top,
        height: HEADER_HEIGHT,
      },
      rows: currentRows,
    });
  }

  return {
    pages,
    warnings,
  };
}

export function buildSetlistPdfLayout(input: SetlistPdfLayoutInput): SetlistPdfLayout {
  const theme = getPdfThemeTokens(input.theme ?? "light");
  const contentTop = MARGINS.top + HEADER_HEIGHT;
  const contentBottom = PAGE_SIZE.height - MARGINS.bottom - FOOTER_HEIGHT;
  const contentWidth = PAGE_SIZE.width - MARGINS.left - MARGINS.right;
  const maxRowsHeight = contentBottom - contentTop;
  const renderableRows = buildRenderableItems(input.event.items);
  const effectiveRowDensity = renderableRows.reduce(
    (total, row) => total + getRowDensityWeight(row.itemType as SetlistPdfRowType),
    0,
  );
  const densityPreset = getDensityPreset(effectiveRowDensity);
  const densityGeometry = DENSITY_PRESETS[densityPreset];
  let rowHeights = densityGeometry.rowHeights;
  let rowGap = densityGeometry.rowGap;
  let rowExpansion = 1;
  let topOffset = 0;

  let { pages, warnings } = buildPagesForGeometry({
    event: input.event,
    renderableRows,
    contentTop,
    maxRowsHeight,
    rowGap,
    rowHeights,
  });

  if (pages.length === 1 && renderableRows.length > 0) {
    const usedHeight = getUsedHeight(pages[0]!.rows, rowGap);
    const expansionConfig = getSinglePageExpansionConfig(densityPreset);
    const targetRowsHeight = Math.min(
      maxRowsHeight * expansionConfig.targetFillRatio,
      usedHeight * expansionConfig.maxExpansion,
    );
    const requestedExpansion = usedHeight > 0 ? targetRowsHeight / usedHeight : 1;

    if (requestedExpansion > 1.04) {
      const nextRowGap = Math.max(1, Math.round(rowGap * requestedExpansion));
      const nextRowHeights = {
        song: Math.max(1, Math.round(rowHeights.song * requestedExpansion)),
        mc: Math.max(1, Math.round(rowHeights.mc * requestedExpansion)),
        transition: Math.max(1, Math.round(rowHeights.transition * requestedExpansion)),
        heading: Math.max(1, Math.round(rowHeights.heading * requestedExpansion)),
      } satisfies Record<SetlistPdfRowType, number>;

      const expanded = buildPagesForGeometry({
        event: input.event,
        renderableRows,
        contentTop,
        maxRowsHeight,
        rowGap: nextRowGap,
        rowHeights: nextRowHeights,
      });

      if (expanded.pages.length === 1) {
        rowGap = nextRowGap;
        rowHeights = nextRowHeights;
        rowExpansion = requestedExpansion;
        const expandedUsedHeight = getUsedHeight(expanded.pages[0]!.rows, rowGap);
        topOffset = Math.max(
          0,
          Math.round((maxRowsHeight - expandedUsedHeight) * expansionConfig.topOffsetRatio),
        );
        const offsetPages = buildPagesForGeometry({
          event: input.event,
          renderableRows,
          contentTop,
          maxRowsHeight,
          rowGap,
          rowHeights,
          topOffset,
        });

        pages = offsetPages.pages;
        warnings = offsetPages.warnings;
      }
    }
  }

  const pageCount = pages.length;

  return {
    pageSize: PAGE_SIZE,
    margins: MARGINS,
    content: {
      left: MARGINS.left,
      right: PAGE_SIZE.width - MARGINS.right,
      top: contentTop,
      width: contentWidth,
      labelWidth: LABEL_COLUMN_WIDTH,
    },
    theme,
    densityPreset,
    pageGeometry: {
      contentTop,
      contentBottom,
      maxRowsHeight,
      rowGap,
      rowHeights,
      effectiveRowDensity,
      rowExpansion,
      topOffset,
    },
    pageCount,
    warnings,
    pages: pages.map((page, index) => ({
      pageNumber: index + 1,
      header: page.header,
      footer: {
        text: `${index + 1} / ${pageCount}`,
        top: PAGE_SIZE.height - MARGINS.bottom - 2,
      },
      rows: page.rows,
    })),
  };
}
