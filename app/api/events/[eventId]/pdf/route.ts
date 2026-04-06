import { requireAuthSession } from "@/lib/auth";
import { formatEventDateForFilename } from "@/lib/pdf/format-event-date";
import { generatePdfFromDocument } from "@/lib/pdf/generate-pdf-from-document";
import { signPdfDocumentToken } from "@/lib/pdf/document-token";
import { buildPdfDocumentUrl } from "@/lib/pdf/document-url";
import { findEventWithItemsById } from "@/lib/repositories/event-repository";
import {
  getDefaultPdfOutputPresetId,
  isPdfOutputPresetId,
  type PdfOutputPresetId,
} from "@/lib/pdf/output-presets";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";

export const runtime = "nodejs";

const PDF_DOCUMENT_TOKEN_TTL_SECONDS = 60 * 5;

type PdfRouteContext = {
  params: Promise<{
    eventId: string;
  }>;
};

function resolveTheme(request: Request): PdfThemeName {
  const theme = new URL(request.url).searchParams.get("theme");
  return theme === "dark" ? "dark" : "light";
}

function resolvePreset(request: Request, theme: PdfThemeName): PdfOutputPresetId {
  const value = new URL(request.url).searchParams.get("preset");

  if (value && isPdfOutputPresetId(value)) {
    return value;
  }

  return getDefaultPdfOutputPresetId(theme);
}

function slugify(value: string | null | undefined) {
  if (!value) {
    return "setlist";
  }

  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "setlist";
}

function buildFilename(event: {
  eventDate: Date | null;
  venue: string | null;
}) {
  const date = formatEventDateForFilename(event.eventDate);
  const venueSlug = event.venue ? slugify(event.venue) : "unknown-venue";
  return `${date}_${venueSlug}_setlist.pdf`;
}

function toArrayBuffer(bytes: Uint8Array) {
  return Uint8Array.from(bytes).buffer;
}

export async function GET(request: Request, context: PdfRouteContext) {
  try {
    const session = await requireAuthSession();
    const { eventId } = await context.params;
    const event = await findEventWithItemsById(eventId);

    if (!event || event.ownerUserId !== session.user.id) {
      return Response.json({ error: "Event not found." }, { status: 404 });
    }

    const theme = resolveTheme(request);
    const preset = resolvePreset(request, theme);
    const token = signPdfDocumentToken({
      eventId: event.id,
      theme,
      expiresInSeconds: PDF_DOCUMENT_TOKEN_TTL_SECONDS,
    });
    const documentUrl = buildPdfDocumentUrl({
      eventId: event.id,
      theme,
      preset,
      token,
    });
    const pdfBytes = await generatePdfFromDocument({ documentUrl });
    const filename = buildFilename(event);

    return new Response(toArrayBuffer(pdfBytes), {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized.") {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    throw error;
  }
}
