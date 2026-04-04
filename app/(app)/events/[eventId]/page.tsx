import { notFound, redirect } from "next/navigation";
import {
  addEventItemAction,
  createDraftEventFormAction,
  deleteEventFormAction,
  deleteEventItemAction,
  duplicateEventFormAction,
  reorderEventItemsAction,
  updateEventItemAction,
  updateEventMetadataAction,
} from "@/app/(app)/events/actions";
import { saveTemplateFromEventFormAction } from "@/app/(app)/templates/actions";
import { EventEditorPageContent } from "@/components/event-editor-page-content";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import {
  getEventForUser,
  listEventSummaries,
} from "@/lib/services/events-service";
import { getAuthSessionWithPlan } from "@/lib/subscription";
import { resolveAuthenticatedUserIdentity } from "@/lib/user-identity";

export const dynamic = "force-dynamic";

type EventEditorPageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams?: Promise<{
    theme?: string | string[];
    deleteItem?: string | string[];
  }>;
};

function resolveTheme(value: string | string[] | undefined): PdfThemeName {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "light" ? "light" : "dark";
}

function resolveDeleteItem(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export { EventEditorPageContent };

export default async function EventEditorPage({
  params,
  searchParams,
}: EventEditorPageProps) {
  const authSession = await getAuthSessionWithPlan();

  if (!authSession) {
    redirect("/login");
  }

  const [{ eventId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const currentTheme = resolveTheme(resolvedSearchParams?.theme);
  const pendingDeleteItemId = resolveDeleteItem(resolvedSearchParams?.deleteItem);
  const { session, currentPlan } = authSession;
  const userIdentity = resolveAuthenticatedUserIdentity(session.user);

  const [events, event] = await Promise.all([
    listEventSummaries({ userId: session.user.id }),
    getEventForUser({
      userId: session.user.id,
      eventId,
    }).catch((error: Error) => {
      if (error.message === "Event not found.") {
        return null;
      }

      throw error;
    }),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <EventEditorPageContent
      events={events}
      event={event}
      currentTheme={currentTheme}
      currentPlan={currentPlan.plan}
      userIdentity={userIdentity}
      pendingDeleteItemId={pendingDeleteItemId}
      createEventAction={createDraftEventFormAction}
      duplicateEventAction={duplicateEventFormAction}
      deleteEventAction={deleteEventFormAction}
      updateMetadataAction={updateEventMetadataAction}
      addItemAction={addEventItemAction}
      updateItemAction={updateEventItemAction}
      reorderItemsAction={reorderEventItemsAction}
      deleteItemAction={deleteEventItemAction}
      saveTemplateAction={saveTemplateFromEventFormAction}
    />
  );
}
