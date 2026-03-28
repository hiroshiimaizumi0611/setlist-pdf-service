import { buildRenderableItems } from "../setlist/build-renderable-items";
import type { EventWithItems } from "../repositories/event-repository";
import { getPdfThemeTokens, type PdfThemeName, type PdfThemeTokens } from "./theme-tokens";
import { formatEventDateForDisplay } from "./format-event-date";

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
const ROW_GAP = 6;
const LABEL_COLUMN_WIDTH = 44;
const SONG_CUE_PREFIX = "M";
const SONG_TITLE_LIMIT = 24;
const HEADING_TITLE_LIMIT = 20;
const TRANSITION_TITLE_LIMIT = 18;
// These virtual heights track the HTML document row boxes so pagination and paper output
// stay in sync when rows are absolutely positioned into each page.
const ROW_HEIGHTS = {
  song: 32,
  mc: 28,
  transition: 32,
  heading: 42,
} as const;

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
  pageCount: number;
  warnings: SetlistPdfWarning[];
  pages: SetlistPdfPageLayout[];
};

function getRowHeight(itemType: RenderableRow["itemType"]) {
  switch (itemType) {
    case "heading":
      return ROW_HEIGHTS.heading;
    case "mc":
      return ROW_HEIGHTS.mc;
    case "transition":
      return ROW_HEIGHTS.transition;
    default:
      return ROW_HEIGHTS.song;
  }
}

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

export function buildSetlistPdfLayout(input: SetlistPdfLayoutInput): SetlistPdfLayout {
  const theme = getPdfThemeTokens(input.theme ?? "light");
  const contentTop = MARGINS.top + HEADER_HEIGHT;
  const contentBottom = PAGE_SIZE.height - MARGINS.bottom - FOOTER_HEIGHT;
  const contentWidth = PAGE_SIZE.width - MARGINS.left - MARGINS.right;
  const maxRowsHeight = contentBottom - contentTop;
  const renderableRows = buildRenderableItems(input.event.items);
  const pages: Omit<SetlistPdfPageLayout, "pageNumber" | "footer">[] = [];
  const warnings: SetlistPdfWarning[] = [];

  let currentRows: SetlistPdfPageLayout["rows"] = [];
  let currentTop = contentTop;
  let usedHeight = 0;
  let songCount = 1;

  for (const row of renderableRows) {
    const rowHeight = getRowHeight(row.itemType);
    const nextHeight = currentRows.length === 0 ? rowHeight : usedHeight + ROW_GAP + rowHeight;
    const cueLabel = getCueLabel(row, songCount);
    const displayText = getDisplayText(row);
    const titleLimit = getTitleLimit(row.itemType);
    const shouldWarn = row.itemType !== "mc" && row.title.length > titleLimit;

    if (row.itemType === "song") {
      songCount += 1;
    }

    if (currentRows.length > 0 && nextHeight > maxRowsHeight) {
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
      currentTop = contentTop;
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

    usedHeight = currentRows.length === 1 ? rowHeight : usedHeight + ROW_GAP + rowHeight;
    currentTop += rowHeight + ROW_GAP;
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
