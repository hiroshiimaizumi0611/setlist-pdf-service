import { notFound, redirect } from "next/navigation";
import { PdfDocument } from "@/components/pdf-document";
import { findEventWithItemsById } from "@/lib/repositories/event-repository";
import { buildSetlistPdfLayout } from "@/lib/pdf/build-layout";
import { verifyPdfDocumentToken } from "@/lib/pdf/document-token";
import {
  getRequestedPdfOutputPresetId,
  resolvePdfOutputPresetSelection,
} from "@/lib/pdf/output-presets";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { getEventForUser } from "@/lib/services/events-service";
import { getAuthSessionWithPlan } from "@/lib/subscription";

export const dynamic = "force-dynamic";

type EventPdfDocumentPageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams?: Promise<{
    theme?: string | string[];
    token?: string | string[];
    preset?: string | string[];
  }>;
};

function resolveTheme(value: string | string[] | undefined): PdfThemeName {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "light" ? "light" : "dark";
}

function resolveToken(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

async function getTokenAuthorizedEvent({
  eventId,
  theme,
  preset,
  token,
}: {
  eventId: string;
  theme: PdfThemeName;
  preset: string;
  token: string;
}) {
  const payload = verifyPdfDocumentToken(token);

  if (
    !payload ||
    payload.eventId !== eventId ||
    payload.theme !== theme ||
    payload.preset !== preset
  ) {
    return null;
  }

  return findEventWithItemsById(eventId);
}

export default async function EventPdfDocumentPage({
  params,
  searchParams,
}: EventPdfDocumentPageProps) {
  const [{ eventId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const currentTheme = resolveTheme(resolvedSearchParams?.theme);
  const token = resolveToken(resolvedSearchParams?.token);
  const requestedPresetId = getRequestedPdfOutputPresetId(
    resolvedSearchParams?.preset,
    currentTheme,
  );

  if (token) {
    const event = await getTokenAuthorizedEvent({
      eventId,
      theme: currentTheme,
      preset: requestedPresetId,
      token,
    });

    if (!event) {
      return notFound();
    }

    const layout = buildSetlistPdfLayout({
      event,
      theme: currentTheme,
      presetId: requestedPresetId,
    });

    return <PdfDocument event={event} layout={layout} />;
  }

  const authSession = await getAuthSessionWithPlan();

  if (!authSession) {
    return redirect("/login");
  }

  const { session } = authSession;
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

  const { previewPresetId } = resolvePdfOutputPresetSelection({
    requestedPreset: resolvedSearchParams?.preset,
    theme: currentTheme,
    currentPlan: authSession.currentPlan.plan,
  });

  const layout = buildSetlistPdfLayout({
    event,
    theme: currentTheme,
    presetId: previewPresetId,
  });

  return <PdfDocument event={event} layout={layout} />;
}
