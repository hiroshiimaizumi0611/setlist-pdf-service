import { Readable } from "node:stream";
import * as fontkit from "fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { EventWithItems } from "../repositories/event-repository";
import { buildSetlistPdfLayout } from "./build-layout";
import { loadNotoSansJPFont } from "./load-font";
import type { PdfThemeName } from "./theme-tokens";

type RenderSetlistPdfInput = {
  event: Pick<EventWithItems, "title" | "venue" | "eventDate" | "notes" | "items">;
  theme?: PdfThemeName;
  fontUrl?: string;
};

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

function drawHeader(
  page: PDFPage,
  layout: ReturnType<typeof buildSetlistPdfLayout>,
  pageLayout: ReturnType<typeof buildSetlistPdfLayout>["pages"][number],
  font: PDFFont,
) {
  const { pageSize, margins, content, theme } = layout;
  const headerBottom = topToBottomY(pageSize.height, pageLayout.header.top, pageLayout.header.height);
  const headerTextWidth = content.width - 32;

  page.drawRectangle({
    x: margins.left,
    y: headerBottom,
    width: content.width,
    height: pageLayout.header.height - 12,
    color: toRgb(theme.headerBackground),
  });

  page.drawText(truncateText(font, pageLayout.header.title, 21, headerTextWidth), {
    x: margins.left + 16,
    y: headerBottom + pageLayout.header.height - 40,
    size: 21,
    font,
    color: toRgb(theme.primaryText),
  });

  if (pageLayout.header.subtitle) {
    page.drawText(
      truncateText(font, pageLayout.header.subtitle, 10, headerTextWidth),
      {
        x: margins.left + 16,
        y: headerBottom + pageLayout.header.height - 60,
        size: 10,
        font,
        color: toRgb(theme.secondaryText),
      },
    );
  }

  page.drawText(pageLayout.footer.text, {
    x: pageSize.width - margins.right - 28,
    y: topToBottomY(pageSize.height, pageLayout.footer.top, 10),
    size: 9,
    font,
    color: toRgb(theme.secondaryText),
  });

  page.drawLine({
    start: { x: margins.left, y: headerBottom },
    end: { x: pageSize.width - margins.right, y: headerBottom },
    thickness: 1,
    color: toRgb(theme.border),
  });
}

function drawRows(
  page: PDFPage,
  layout: ReturnType<typeof buildSetlistPdfLayout>,
  pageLayout: ReturnType<typeof buildSetlistPdfLayout>["pages"][number],
  font: PDFFont,
) {
  const { pageSize, content, theme } = layout;
  const titleX = content.left + content.labelWidth + 10;
  const titleWidth = content.width - content.labelWidth - 26;

  for (const row of pageLayout.rows) {
    const y = topToBottomY(pageSize.height, row.top, row.height);
    const fill = row.itemType === "heading" ? theme.emphasisFill : theme.rowFill;

    page.drawRectangle({
      x: content.left,
      y,
      width: content.width,
      height: row.height,
      color: toRgb(fill),
    });

    if (row.label) {
      page.drawText(row.label, {
        x: content.left + 8,
        y: y + 5,
        size: 9,
        font,
        color: toRgb(theme.accentText),
      });
    }

    page.drawText(
      truncateText(font, row.title, row.itemType === "heading" ? 14 : 12, titleWidth),
      {
        x: titleX,
        y: y + (row.itemType === "heading" ? 5 : 4),
        size: row.itemType === "heading" ? 14 : 12,
        font,
        color: toRgb(theme.primaryText),
      },
    );
  }
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
    drawRows(page, layout, pageLayout, font);
  }

  return pdfDoc.save();
}
