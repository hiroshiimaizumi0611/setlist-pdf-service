import { notFound, redirect } from "next/navigation";
import {
  addEventItemAction,
  createEventAction,
  deleteEventItemAction,
  reorderEventItemsAction,
  updateEventMetadataAction,
} from "@/app/(app)/events/actions";
import { saveTemplateFromEventAction } from "@/app/(app)/templates/actions";
import { EventEditorPageContent } from "@/components/event-editor-page-content";
import type { PdfThemeName } from "@/lib/pdf/theme-tokens";
import {
  getEventForUser,
  listEventSummaries,
} from "@/lib/services/events-service";
import { getAuthSessionWithPlan } from "@/lib/subscription";

export const dynamic = "force-dynamic";

type EventEditorPageProps = {
  params: Promise<{
    eventId: string;
  }>;
  searchParams?: Promise<{
    theme?: string | string[];
  }>;
};

function resolveTheme(value: string | string[] | undefined): PdfThemeName {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "dark" ? "dark" : "light";
}

function buildDraftEventInput() {
  const now = new Date();
  const token = new Intl.DateTimeFormat("ja-JP-u-ca-gregory", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  })
    .format(now)
    .replaceAll("/", ".");
  const eventDate = new Date(
    `${new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tokyo",
    }).format(now)}T00:00:00.000Z`,
  );

  return {
    title: `${token} 新規公演`,
    venue: "",
    eventDate,
    notes: "本番用セットリスト",
  };
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
  const { session, currentPlan } = authSession;

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

  async function createDraftEvent(formData: FormData) {
    "use server";

    const draft = await createEventAction(buildDraftEventInput());
    const theme = resolveTheme(formData.get("theme")?.toString());
    redirect(`/events/${draft.id}?theme=${theme}`);
  }

  return (
    <EventEditorPageContent
      events={events}
      event={event}
      currentTheme={currentTheme}
      currentPlan={currentPlan.plan}
      createEventAction={createDraftEvent}
      updateMetadataAction={updateEventMetadataAction}
      addItemAction={addEventItemAction}
      reorderItemsAction={reorderEventItemsAction}
      deleteItemAction={deleteEventItemAction}
      saveTemplateAction={saveTemplateFromEventAction}
    />
  );
}
