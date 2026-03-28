import { redirect } from "next/navigation";
import {
  createEventAction,
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
    deleteEvent?: string | string[];
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

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const authSession = await getAuthSessionWithPlan();

  if (!authSession) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const currentTheme = resolveTheme(resolvedSearchParams?.theme);
  const pendingDeleteEventId = Array.isArray(resolvedSearchParams?.deleteEvent)
    ? (resolvedSearchParams?.deleteEvent[0] ?? null)
    : (resolvedSearchParams?.deleteEvent ?? null);
  const { session, currentPlan } = authSession;
  const events = await listEventSummaries({ userId: session.user.id });

  async function createDraftEvent(formData: FormData) {
    "use server";

    const event = await createEventAction(buildDraftEventInput());
    const theme = resolveTheme(formData.get("theme")?.toString());
    redirect(`/events/${event.id}?theme=${theme}`);
  }

  return (
    <EventEditorPageContent
      events={events}
      event={null}
      currentTheme={currentTheme}
      currentPlan={currentPlan.plan}
      pendingDeleteEventId={pendingDeleteEventId}
      updateItemAction={updateEventItemAction}
      createEventAction={createDraftEvent}
      duplicateEventAction={duplicateEventFormAction}
      deleteEventAction={deleteEventFormAction}
    />
  );
}
