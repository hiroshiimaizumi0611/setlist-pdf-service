import { redirect } from "next/navigation";
import {
  createDraftEventFormAction,
  deleteEventFormAction,
  duplicateEventFormAction,
  updateEventItemAction,
} from "@/app/(app)/events/actions";
import { EventEditorPageContent } from "@/components/event-editor-page-content";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import { listEventSummaries } from "@/lib/services/events-service";
import { getAuthSessionWithPlan } from "@/lib/subscription";

export const dynamic = "force-dynamic";

type EventsPageProps = {
  searchParams?: Promise<{
    theme?: string | string[];
  }>;
};

function resolveTheme(value: string | string[] | undefined): PdfThemeName {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "light" ? "light" : "dark";
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const authSession = await getAuthSessionWithPlan();

  if (!authSession) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const currentTheme = resolveTheme(resolvedSearchParams?.theme);
  const { session, currentPlan } = authSession;
  const events = await listEventSummaries({ userId: session.user.id });

  return (
    <EventEditorPageContent
      events={events}
      event={null}
      currentTheme={currentTheme}
      currentPlan={currentPlan.plan}
      updateItemAction={updateEventItemAction}
      createEventAction={createDraftEventFormAction}
      duplicateEventAction={duplicateEventFormAction}
      deleteEventAction={deleteEventFormAction}
    />
  );
}
