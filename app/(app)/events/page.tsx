import { redirect } from "next/navigation";
import {
  createDraftEventFormAction,
  deleteEventFormAction,
  duplicateEventFormAction,
} from "@/app/(app)/events/actions";
import { PerformanceArchivePageContent } from "@/components/performance-archive-page-content";
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
    <PerformanceArchivePageContent
      events={events}
      currentTheme={currentTheme}
      currentPlan={currentPlan.plan}
      createEventAction={createDraftEventFormAction}
      duplicateEventAction={duplicateEventFormAction}
      deleteEventAction={deleteEventFormAction}
    />
  );
}
