import { notFound, redirect } from "next/navigation";
import { getAuthSessionWithPlan } from "@/lib/subscription";
import { getEventForUser } from "@/lib/services/events-service";
import { buildSetlistPdfLayout } from "@/lib/pdf/build-layout";
import { buildPdfDocumentUrl } from "@/lib/pdf/document-url";
import {
  resolvePdfOutputPresetSelection,
} from "@/lib/pdf/output-presets";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { PdfPreviewPage } from "@/components/pdf-preview-page";

export const dynamic = "force-dynamic";

type EventPdfPreviewPageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams?: Promise<{
    theme?: string | string[];
    preset?: string | string[];
  }>;
};

function resolveTheme(value: string | string[] | undefined): PdfThemeName {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "light" ? "light" : "dark";
}

export default async function EventPdfPreviewPage({
  params,
  searchParams,
}: EventPdfPreviewPageProps) {
  const authSession = await getAuthSessionWithPlan();

  if (!authSession) {
    return redirect("/login");
  }

  const [{ eventId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const currentTheme = resolveTheme(resolvedSearchParams?.theme);
  const { session } = authSession;
  const {
    requestedPresetId,
    previewPresetId,
    downloadPresetId,
    isExportGated,
  } =
    resolvePdfOutputPresetSelection({
      requestedPreset: resolvedSearchParams?.preset,
      theme: currentTheme,
      currentPlan: authSession.currentPlan.plan,
    });

  const event = await getEventForUser({
    userId: session.user.id,
    eventId,
  }).catch((error: Error) => {
    if (error.message === "Event not found.") {
      return null;
    }

    throw error;
  });

  if (!event) {
    return notFound();
  }

  const layout = buildSetlistPdfLayout({
    event,
    theme: currentTheme,
    presetId: previewPresetId,
  });
  const documentUrl = buildPdfDocumentUrl({
    eventId: event.id,
    theme: currentTheme,
    preset: previewPresetId,
  });
  const downloadParams = new URLSearchParams({
    theme: currentTheme,
    preset: downloadPresetId,
  });

  return (
    <PdfPreviewPage
      event={event}
      layout={layout}
      currentTheme={currentTheme}
      currentPlan={authSession.currentPlan.plan}
      requestedPresetId={requestedPresetId}
      isExportGated={isExportGated}
      documentHref={documentUrl}
      downloadHref={`/api/events/${event.id}/pdf?${downloadParams.toString()}`}
    />
  );
}
