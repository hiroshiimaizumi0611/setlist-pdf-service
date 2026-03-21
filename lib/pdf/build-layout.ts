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
const ROW_GAP = 4;
const LABEL_COLUMN_WIDTH = 44;

type RenderableRow = ReturnType<typeof buildRenderableItems<EventWithItems["items"][number]>>[number];

export type SetlistPdfLayoutInput = {
  event: Pick<EventWithItems, "title" | "venue" | "eventDate" | "notes" | "items">;
  theme?: PdfThemeName;
};

export type SetlistPdfRowLayout = {
  id: string;
  itemType: RenderableRow["itemType"];
  label: string | null;
  title: string;
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
  pages: SetlistPdfPageLayout[];
};

function getRowHeight(itemType: RenderableRow["itemType"]) {
  switch (itemType) {
    case "heading":
      return 24;
    case "mc":
    case "transition":
      return 22;
    default:
      return 20;
  }
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

  let currentRows: SetlistPdfPageLayout["rows"] = [];
  let currentTop = contentTop;
  let usedHeight = 0;

  for (const row of renderableRows) {
    const rowHeight = getRowHeight(row.itemType);
    const nextHeight = currentRows.length === 0 ? rowHeight : usedHeight + ROW_GAP + rowHeight;

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
      label: row.label,
      title: row.title,
      top: currentTop,
      height: rowHeight,
    });

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
