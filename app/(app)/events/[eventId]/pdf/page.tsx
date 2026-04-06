import { notFound, redirect } from "next/navigation";
import { getAuthSessionWithPlan } from "@/lib/subscription";
import { getEventForUser } from "@/lib/services/events-service";
import { buildSetlistPdfLayout } from "@/lib/pdf/build-layout";
import { buildPdfDocumentUrl } from "@/lib/pdf/document-url";
import {
  PDF_OUTPUT_PRESET_BY_ID,
  type PdfOutputPresetId,
} from "@/lib/pdf/output-presets";
import { APP_PLAN_NAMES, type AppPlan } from "@/lib/stripe/plans";
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

function resolveDefaultPreset(theme: PdfThemeName): PdfOutputPresetId {
  return theme === "light" ? "standard-light" : "standard-dark";
}

function resolvePreset({
  value,
  theme,
  currentPlan,
}: {
  value: string | string[] | undefined;
  theme: PdfThemeName;
  currentPlan: AppPlan;
}) {
  const fallbackPresetId = resolveDefaultPreset(theme);
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate || !(candidate in PDF_OUTPUT_PRESET_BY_ID)) {
    return {
      requestedPresetId: fallbackPresetId,
      activePresetId: fallbackPresetId,
      blockedPresetId: null,
    };
  }

  const requestedPresetId = candidate as PdfOutputPresetId;
  const requestedPreset = PDF_OUTPUT_PRESET_BY_ID[requestedPresetId];

  if (
    requestedPreset.requiredPlan === APP_PLAN_NAMES.pro &&
    currentPlan !== APP_PLAN_NAMES.pro
  ) {
    return {
      requestedPresetId: requestedPreset.id,
      activePresetId: fallbackPresetId,
      blockedPresetId: requestedPreset.id,
    };
  }

  return {
    requestedPresetId: requestedPreset.id,
    activePresetId: requestedPreset.id,
    blockedPresetId: null,
  };
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
  const { requestedPresetId, activePresetId, blockedPresetId } = resolvePreset({
    value: resolvedSearchParams?.preset,
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
    presetId: activePresetId,
  });
  const documentUrl = buildPdfDocumentUrl({
    eventId: event.id,
    theme: currentTheme,
    preset: activePresetId,
  });
  const downloadParams = new URLSearchParams({
    theme: currentTheme,
    preset: activePresetId,
  });

  return (
    <PdfPreviewPage
      event={event}
      layout={layout}
      currentTheme={currentTheme}
      currentPlan={authSession.currentPlan.plan}
      requestedPresetId={requestedPresetId}
      activePresetId={activePresetId}
      blockedPresetId={blockedPresetId}
      documentHref={documentUrl}
      downloadHref={`/api/events/${event.id}/pdf?${downloadParams.toString()}`}
    />
  );
}
