import { Readable } from "node:stream";
import * as fontkit from "fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { EventWithItems } from "../repositories/event-repository";
import { buildSetlistPdfLayout } from "./build-layout";
import { loadNotoSansJPFont } from "./load-font";
import type { PdfThemeName } from "./theme-tokens";

type RenderSetlistPdfInput = {
  event: Pick<
    EventWithItems,
    "title" | "venue" | "eventDate" | "notes" | "items"
  > & {
    updatedAt?: Date | string | null;
  };
  theme?: PdfThemeName;
  fontUrl?: string;
};

const CUE_COLUMN_WIDTH = 76;
const HEADER_PADDING_X = 16;
const HEADER_TITLE_SIZE = 24;
const HEADER_SUBTITLE_SIZE = 10;
const SONG_TITLE_SIZE = 15;
const SONG_CUE_SIZE = 10;
const MC_TITLE_SIZE = 15;
const HEADING_TITLE_SIZE = 14;
const TRANSITION_TITLE_SIZE = 13;
const FOOTER_SIZE = 9;

function toRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);

  return rgb(
    ((value >> 16) & 0xff) / 255,
    ((value >> 8) & 0xff) / 255,
    (value & 0xff) / 255,
  );
}

function topToBottomY(pageHeight: number, top: number, height = 0) {
  return pageHeight - top - height;
}

function createFontkitCompat() {
  return {
    ...fontkit,
    async create(fontData: Uint8Array) {
      const font = await fontkit.create(fontData);
      const originalCreateSubset = font.createSubset.bind(font);

      font.createSubset = () => {
        const subset = originalCreateSubset();

        if (
          typeof subset.encodeStream !== "function" &&
          typeof subset.encode === "function"
        ) {
          subset.encodeStream = () => Readable.from([Buffer.from(subset.encode())]);
        }

        return subset;
      };

      return font;
    },
  };
}

function truncateText(font: PDFFont, text: string, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) {
    return text;
  }

  let candidate = text;

  while (candidate.length > 0) {
    const truncated = `${candidate}…`;

    if (font.widthOfTextAtSize(truncated, size) <= maxWidth) {
      return truncated;
    }

    candidate = candidate.slice(0, -1);
  }

  return "…";
}

function formatUpdatedAtForDisplay(updatedAt: Date | string | null | undefined) {
  if (!updatedAt) {
    return null;
  }

  const date = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;

  if (!year || !month || !day || !hour || !minute) {
    return null;
  }

  return `${year}.${month}.${day} ${hour}:${minute}`;
}

function drawRowBorder(page: PDFPage, x: number, y: number, width: number, color: string) {
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    thickness: 0.75,
    color: toRgb(color),
  });
}

function drawCueColumn(
  page: PDFPage,
  x: number,
  y: number,
  height: number,
  theme: ReturnType<typeof buildSetlistPdfLayout>["theme"],
) {
  page.drawRectangle({
    x,
    y,
    width: CUE_COLUMN_WIDTH,
    height,
    color: toRgb(theme.headerBackground),
  });
  page.drawLine({
    start: { x: x + CUE_COLUMN_WIDTH, y },
    end: { x: x + CUE_COLUMN_WIDTH, y: y + height },
    thickness: 1,
    color: toRgb(theme.border),
  });
}

function drawCenteredText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  width: number,
  size: number,
  color: string,
) {
  const textWidth = font.widthOfTextAtSize(text, size);
  const textX = x + Math.max(0, (width - textWidth) / 2);

  page.drawText(text, {
    x: textX,
    y,
    size,
    font,
    color: toRgb(color),
  });
}

function drawHeader(
  page: PDFPage,
  layout: ReturnType<typeof buildSetlistPdfLayout>,
  pageLayout: ReturnType<typeof buildSetlistPdfLayout>["pages"][number],
  font: PDFFont,
) {
  const { pageSize, margins, content, theme } = layout;
  const headerBottom = topToBottomY(pageSize.height, pageLayout.header.top, pageLayout.header.height);
  const headerTextWidth = content.width - HEADER_PADDING_X * 2;

  page.drawRectangle({
    x: margins.left,
    y: headerBottom,
    width: content.width,
    height: pageLayout.header.height - 12,
    color: toRgb(theme.headerBackground),
  });

  page.drawText(
    truncateText(font, pageLayout.header.title, HEADER_TITLE_SIZE, headerTextWidth),
    {
      x: margins.left + HEADER_PADDING_X,
      y: headerBottom + pageLayout.header.height - 34,
      size: HEADER_TITLE_SIZE,
      font,
      color: toRgb(theme.primaryText),
    },
  );

  if (pageLayout.header.subtitle) {
    page.drawText(
      truncateText(
        font,
        pageLayout.header.subtitle,
        HEADER_SUBTITLE_SIZE,
        headerTextWidth,
      ),
      {
        x: margins.left + HEADER_PADDING_X,
        y: headerBottom + pageLayout.header.height - 55,
        size: HEADER_SUBTITLE_SIZE,
        font,
        color: toRgb(theme.secondaryText),
      },
    );
  }

  page.drawLine({
    start: { x: margins.left, y: headerBottom },
    end: { x: pageSize.width - margins.right, y: headerBottom },
    thickness: 1,
    color: toRgb(theme.border),
  });

  page.drawLine({
    start: { x: margins.left, y: headerBottom + pageLayout.header.height - 12 },
    end: { x: pageSize.width - margins.right, y: headerBottom + pageLayout.header.height - 12 },
    thickness: 1.5,
    color: toRgb(theme.accentText),
  });
}

function drawSongRow(
  page: PDFPage,
  layout: ReturnType<typeof buildSetlistPdfLayout>,
  row: ReturnType<typeof buildSetlistPdfLayout>["pages"][number]["rows"][number],
  font: PDFFont,
) {
  const { pageSize, content, theme } = layout;
  const y = topToBottomY(pageSize.height, row.top, row.height);
  const titleX = content.left + CUE_COLUMN_WIDTH + 14;

  page.drawRectangle({
    x: content.left,
    y,
    width: content.width,
    height: row.height,
    color: toRgb(theme.rowFill),
  });
  drawCueColumn(page, content.left, y, row.height, theme);
  drawRowBorder(page, content.left, y, content.width, theme.border);

  if (row.cueLabel) {
    drawCenteredText(
      page,
      font,
      row.cueLabel,
      content.left,
      y + 5,
      CUE_COLUMN_WIDTH,
      SONG_CUE_SIZE,
      theme.accentText,
    );
  }

  page.drawText(row.displayText, {
    x: titleX,
    y: y + 4,
    size: SONG_TITLE_SIZE,
    font,
    color: toRgb(theme.primaryText),
  });
}

function drawMcRow(
  page: PDFPage,
  layout: ReturnType<typeof buildSetlistPdfLayout>,
  row: ReturnType<typeof buildSetlistPdfLayout>["pages"][number]["rows"][number],
  font: PDFFont,
) {
  const { pageSize, content, theme } = layout;
  const y = topToBottomY(pageSize.height, row.top, row.height);
  const titleAreaX = content.left + CUE_COLUMN_WIDTH;
  const titleAreaWidth = content.width - CUE_COLUMN_WIDTH;
  const displayText = row.displayText;
  const displaySize = MC_TITLE_SIZE;
  const textWidth = font.widthOfTextAtSize(displayText, displaySize);
  const pillWidth = Math.min(titleAreaWidth - 28, textWidth + 28);
  const pillX = titleAreaX + (titleAreaWidth - pillWidth) / 2;
  const textX = titleAreaX + (titleAreaWidth - textWidth) / 2;

  page.drawRectangle({
    x: content.left,
    y,
    width: content.width,
    height: row.height,
    color: toRgb(theme.emphasisFill),
  });
  drawCueColumn(page, content.left, y, row.height, theme);
  drawRowBorder(page, content.left, y, content.width, theme.border);

  if (pillWidth > 0) {
    page.drawRectangle({
      x: pillX,
      y: y + 4,
      width: pillWidth,
      height: row.height - 8,
      color: toRgb(theme.headerBackground),
    });
  }

  page.drawText(displayText, {
    x: Math.max(titleAreaX + 14, textX),
    y: y + 5,
    size: displaySize,
    font,
    color: toRgb(theme.primaryText),
  });
}

function drawTransitionRow(
  page: PDFPage,
  layout: ReturnType<typeof buildSetlistPdfLayout>,
  row: ReturnType<typeof buildSetlistPdfLayout>["pages"][number]["rows"][number],
  font: PDFFont,
) {
  const { pageSize, content, theme } = layout;
  const y = topToBottomY(pageSize.height, row.top, row.height);
  const titleAreaX = content.left + CUE_COLUMN_WIDTH;
  const titleAreaWidth = content.width - CUE_COLUMN_WIDTH;
  const displaySize = TRANSITION_TITLE_SIZE;
  const textWidth = font.widthOfTextAtSize(row.displayText, displaySize);
  const centerX = titleAreaX + titleAreaWidth / 2;
  const gap = textWidth / 2 + 12;

  page.drawRectangle({
    x: content.left,
    y,
    width: content.width,
    height: row.height,
    color: toRgb(theme.rowFill),
  });
  drawCueColumn(page, content.left, y, row.height, theme);
  drawRowBorder(page, content.left, y, content.width, theme.border);

  if (row.cueLabel) {
    drawCenteredText(
      page,
      font,
      row.cueLabel,
      content.left,
      y + 5,
      CUE_COLUMN_WIDTH,
      SONG_CUE_SIZE,
      theme.accentText,
    );
  }

  page.drawLine({
    start: { x: titleAreaX + 12, y: y + row.height / 2 },
    end: { x: centerX - gap, y: y + row.height / 2 },
    thickness: 1,
    color: toRgb(theme.accentText),
  });
  page.drawLine({
    start: { x: centerX + gap, y: y + row.height / 2 },
    end: { x: content.right - 12, y: y + row.height / 2 },
    thickness: 1,
    color: toRgb(theme.accentText),
  });

  drawCenteredText(
    page,
    font,
    row.displayText,
    titleAreaX,
    y + 4,
    titleAreaWidth,
    displaySize,
    theme.primaryText,
  );
}

function drawHeadingRow(
  page: PDFPage,
  layout: ReturnType<typeof buildSetlistPdfLayout>,
  row: ReturnType<typeof buildSetlistPdfLayout>["pages"][number]["rows"][number],
  font: PDFFont,
) {
  const { pageSize, content, theme } = layout;
  const y = topToBottomY(pageSize.height, row.top, row.height);
  const titleX = content.left + CUE_COLUMN_WIDTH + 14;

  page.drawRectangle({
    x: content.left,
    y,
    width: content.width,
    height: row.height,
    color: toRgb(theme.emphasisFill),
  });
  drawCueColumn(page, content.left, y, row.height, theme);
  drawRowBorder(page, content.left, y, content.width, theme.border);

  if (row.cueLabel) {
    drawCenteredText(
      page,
      font,
      row.cueLabel,
      content.left,
      y + 4,
      CUE_COLUMN_WIDTH,
      HEADING_TITLE_SIZE,
      theme.accentText,
    );
  }

  page.drawText(row.displayText, {
    x: titleX,
    y: y + 5,
    size: HEADING_TITLE_SIZE,
    font,
    color: toRgb(theme.primaryText),
  });
}

function drawFooter(
  page: PDFPage,
  layout: ReturnType<typeof buildSetlistPdfLayout>,
  pageLayout: ReturnType<typeof buildSetlistPdfLayout>["pages"][number],
  input: RenderSetlistPdfInput,
  font: PDFFont,
) {
  const { pageSize, margins, content, theme } = layout;
  const updatedAt = formatUpdatedAtForDisplay(input.event.updatedAt);
  const footerText = updatedAt ? `${updatedAt} / ${pageLayout.pageNumber}` : `${pageLayout.pageNumber}`;
  const footerWidth = content.width - HEADER_PADDING_X * 2;
  const footerX = margins.left + HEADER_PADDING_X;
  const footerY = topToBottomY(pageSize.height, pageLayout.footer.top, FOOTER_SIZE);

  page.drawText(truncateText(font, footerText, FOOTER_SIZE, footerWidth), {
    x: footerX,
    y: footerY,
    size: FOOTER_SIZE,
    font,
    color: toRgb(theme.secondaryText),
  });
}

function drawRows(
  page: PDFPage,
  layout: ReturnType<typeof buildSetlistPdfLayout>,
  pageLayout: ReturnType<typeof buildSetlistPdfLayout>["pages"][number],
  input: RenderSetlistPdfInput,
  font: PDFFont,
) {
  for (const row of pageLayout.rows) {
    switch (row.itemType) {
      case "mc":
        drawMcRow(page, layout, row, font);
        break;
      case "transition":
        drawTransitionRow(page, layout, row, font);
        break;
      case "heading":
        drawHeadingRow(page, layout, row, font);
        break;
      default:
        drawSongRow(page, layout, row, font);
        break;
    }
  }

  drawFooter(page, layout, pageLayout, input, font);
}

export async function renderSetlistPdf(input: RenderSetlistPdfInput) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(
    createFontkitCompat() as unknown as Parameters<typeof pdfDoc.registerFontkit>[0],
  );

  const [fontBytes, layout] = await Promise.all([
    loadNotoSansJPFont(input.fontUrl),
    Promise.resolve(buildSetlistPdfLayout(input)),
  ]);
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });

  pdfDoc.setTitle(`${input.event.title} Setlist`);
  pdfDoc.setSubject("Setlist PDF");
  pdfDoc.setProducer("Setlist PDF Service");

  for (const pageLayout of layout.pages) {
    const page = pdfDoc.addPage([layout.pageSize.width, layout.pageSize.height]);

    page.drawRectangle({
      x: 0,
      y: 0,
      width: layout.pageSize.width,
      height: layout.pageSize.height,
      color: toRgb(layout.theme.pageBackground),
    });

    drawHeader(page, layout, pageLayout, font);
    drawRows(page, layout, pageLayout, input, font);
  }

  return pdfDoc.save();
}
