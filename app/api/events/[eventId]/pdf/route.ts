import { requireAuthSession } from "@/lib/auth";
import { formatEventDateForFilename } from "@/lib/pdf/format-event-date";
import { renderSetlistPdf } from "@/lib/pdf/render-setlist-pdf";
import { findEventWithItemsById } from "@/lib/repositories/event-repository";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";

export const runtime = "nodejs";

type PdfRouteContext = {
  params: Promise<{
    eventId: string;
  }>;
};

function resolveTheme(request: Request): PdfThemeName {
  const theme = new URL(request.url).searchParams.get("theme");
  return theme === "dark" ? "dark" : "light";
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

export async function GET(request: Request, context: PdfRouteContext) {
  try {
    const session = await requireAuthSession();
    const { eventId } = await context.params;
    const event = await findEventWithItemsById(eventId);

    if (!event || event.ownerUserId !== session.user.id) {
      return Response.json({ error: "Event not found." }, { status: 404 });
    }

    const pdfBytes = await renderSetlistPdf({
      event,
      theme: resolveTheme(request),
    });
    const filename = buildFilename(event);

    return new Response(Uint8Array.from(pdfBytes).buffer as ArrayBuffer, {
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
