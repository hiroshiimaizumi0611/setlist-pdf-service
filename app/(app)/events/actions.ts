"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  addEventItem,
  createEvent,
  deleteEvent,
  deleteEventItem,
  duplicateEvent,
  reorderEventItems,
  updateEventItem,
  updateEventMetadata,
} from "@/lib/services/events-service";

async function requireUserId() {
  const requestHeaders = new Headers(await headers());
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user.id) {
    throw new Error("Unauthorized.");
  }

  return session.user.id;
}

function revalidateEventViews(eventId: string) {
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
}

function resolveTheme(value: FormDataEntryValue | null) {
  return value === "dark" ? "dark" : "light";
}

async function duplicateEventForCurrentUser(
  input: Omit<Parameters<typeof duplicateEvent>[0], "userId">,
) {
  const event = await duplicateEvent({
    ...input,
    userId: await requireUserId(),
  });

  revalidateEventViews(event.id);
  return event;
}

export async function createEventAction(
  input: Omit<Parameters<typeof createEvent>[0], "userId">,
) {
  const event = await createEvent({
    ...input,
    userId: await requireUserId(),
  });
  revalidateEventViews(event.id);
  return event;
}

export async function updateEventMetadataAction(
  input: Omit<Parameters<typeof updateEventMetadata>[0], "userId">,
) {
  const event = await updateEventMetadata({
    ...input,
    userId: await requireUserId(),
  });
  revalidateEventViews(event.id);
  return event;
}

export async function addEventItemAction(
  input: Omit<Parameters<typeof addEventItem>[0], "userId">,
) {
  const event = await addEventItem({
    ...input,
    userId: await requireUserId(),
  });
  revalidateEventViews(event.id);
  return event;
}

export async function updateEventItemAction(
  input: Omit<Parameters<typeof updateEventItem>[0], "userId">,
) {
  const event = await updateEventItem({
    ...input,
    userId: await requireUserId(),
  });
  revalidateEventViews(event.id);
  return event;
}

export async function deleteEventItemAction(
  input: Omit<Parameters<typeof deleteEventItem>[0], "userId">,
) {
  const event = await deleteEventItem({
    ...input,
    userId: await requireUserId(),
  });
  revalidateEventViews(event.id);
  return event;
}

export async function deleteEventAction(
  input: Omit<Parameters<typeof deleteEvent>[0], "userId">,
) {
  const event = await deleteEvent({
    ...input,
    userId: await requireUserId(),
  });
  revalidateEventViews(event.id);
  return event;
}

export async function reorderEventItemsAction(
  input: Omit<Parameters<typeof reorderEventItems>[0], "userId">,
) {
  const event = await reorderEventItems({
    ...input,
    userId: await requireUserId(),
  });
  revalidateEventViews(event.id);
  return event;
}

export async function duplicateEventAction(
  input: Omit<Parameters<typeof duplicateEvent>[0], "userId">,
) {
  return duplicateEventForCurrentUser(input);
}

export async function duplicateEventFormAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const theme = resolveTheme(formData.get("theme"));

  const event = await duplicateEventForCurrentUser({ eventId });
  redirect(`/events/${event.id}?theme=${theme}`);
}

export async function deleteEventFormAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const theme = resolveTheme(formData.get("theme"));

  await deleteEventAction({ eventId });
  redirect(`/events?theme=${theme}`);
}
