import { db } from "../db/client";
import {
  createEventRecord,
  createSetlistItem,
  createSetlistItems,
  deleteEventRecord,
  deleteSetlistItemRecord,
  findEventWithItemsById,
  findLastSetlistItem,
  listEventSummariesByOwnerUserId,
  reorderSetlistItems,
  type EventSummary,
  type EventWithItems,
  type SetlistItemInsert,
  updateEventRecord,
  updateSetlistItemRecord,
} from "../repositories/event-repository";
import type { setlistItemTypes } from "../db/schema";
import type { PdfThemeName } from "../pdf/theme-tokens";

export type SetlistItemType = (typeof setlistItemTypes)[number];

export type EventItemInput = {
  itemType: SetlistItemType;
  title: string;
  artist?: string | null;
  durationSeconds?: number | null;
  notes?: string | null;
};

export type EventMetadataInput = {
  title: string;
  venue?: string | null;
  eventDate?: Date | null;
  notes?: string | null;
  theme?: PdfThemeName | null;
};

type EventCommandInput = EventMetadataInput & {
  userId: string;
};

type EventItemCommandInput = EventItemInput & {
  userId: string;
  eventId: string;
};

function normalizeNullableText(value?: string | null) {
  return value?.trim() ? value.trim() : null;
}

function normalizeTitle(value: string) {
  const title = value.trim();

  if (!title) {
    throw new Error("Title is required.");
  }

  return title;
}

function normalizeTheme(value?: PdfThemeName | null) {
  return value === "light" ? "light" : "dark";
}

function normalizeItem(input: EventItemInput) {
  return {
    itemType: input.itemType,
    title: normalizeTitle(input.title),
    artist: normalizeNullableText(input.artist),
    durationSeconds: input.durationSeconds ?? null,
    notes: normalizeNullableText(input.notes),
  };
}

async function getOwnedEventOrThrow(eventId: string, userId: string) {
  const event = await findEventWithItemsById(eventId);

  if (!event || event.ownerUserId !== userId) {
    throw new Error("Event not found.");
  }

  return event;
}

export async function listEventSummaries(input: {
  userId: string;
}): Promise<EventSummary[]> {
  return listEventSummariesByOwnerUserId(input.userId);
}

function mapItemInsert(
  eventId: string,
  position: number,
  input: EventItemInput,
): SetlistItemInsert {
  const item = normalizeItem(input);

  return {
    id: crypto.randomUUID(),
    eventId,
    position,
    itemType: item.itemType,
    title: item.title,
    artist: item.artist,
    durationSeconds: item.durationSeconds,
    notes: item.notes,
  };
}

export async function createEvent(input: EventCommandInput & { items?: EventItemInput[] }) {
  const eventId = crypto.randomUUID();

  return db.transaction(async (tx) => {
    await createEventRecord(
      {
        id: eventId,
        ownerUserId: input.userId,
        title: normalizeTitle(input.title),
        venue: normalizeNullableText(input.venue),
        theme: normalizeTheme(input.theme),
        eventDate: input.eventDate ?? null,
        notes: normalizeNullableText(input.notes),
      },
      tx,
    );

    if (input.items?.length) {
      await createSetlistItems(
        input.items.map((item, index) => mapItemInsert(eventId, index + 1, item)),
        tx,
      );
    }

    const event = await findEventWithItemsById(eventId, tx);

    if (!event) {
      throw new Error("Failed to create event.");
    }

    return event;
  });
}

export async function updateEventMetadata(
  input: EventCommandInput & { eventId: string },
) {
  const currentEvent = await getOwnedEventOrThrow(input.eventId, input.userId);

  return db.transaction(async (tx) => {
    await updateEventRecord(
      input.eventId,
      {
        title: normalizeTitle(input.title),
        venue: normalizeNullableText(input.venue),
        theme: normalizeTheme(input.theme ?? currentEvent.theme),
        eventDate: input.eventDate ?? null,
        notes: normalizeNullableText(input.notes),
        updatedAt: new Date(),
      },
      tx,
    );

    const updatedEvent = await findEventWithItemsById(input.eventId, tx);

    if (!updatedEvent) {
      throw new Error("Event not found.");
    }

    return updatedEvent;
  });
}

export async function addEventItem(input: EventItemCommandInput) {
  await getOwnedEventOrThrow(input.eventId, input.userId);

  return db.transaction(async (tx) => {
    const lastItem = await findLastSetlistItem(input.eventId, tx);

    await createSetlistItem(
      mapItemInsert(input.eventId, (lastItem?.position ?? 0) + 1, input),
      tx,
    );

    const event = await findEventWithItemsById(input.eventId, tx);

    if (!event) {
      throw new Error("Event not found.");
    }

    return event;
  });
}

export async function updateEventItem(
  input: Partial<EventItemInput> & {
    userId: string;
    eventId: string;
    itemId: string;
  },
) {
  const event = await getOwnedEventOrThrow(input.eventId, input.userId);
  const item = event.items.find((candidate) => candidate.id === input.itemId);

  if (!item) {
    throw new Error("Item not found.");
  }

  return db.transaction(async (tx) => {
    await updateSetlistItemRecord(
      input.itemId,
      {
        itemType: input.itemType ?? item.itemType,
        title: input.title ? normalizeTitle(input.title) : item.title,
        artist:
          input.artist === undefined
            ? item.artist
            : normalizeNullableText(input.artist),
        durationSeconds:
          input.durationSeconds === undefined
            ? item.durationSeconds
            : input.durationSeconds,
        notes:
          input.notes === undefined ? item.notes : normalizeNullableText(input.notes),
        updatedAt: new Date(),
      },
      tx,
    );

    const updatedEvent = await findEventWithItemsById(input.eventId, tx);

    if (!updatedEvent) {
      throw new Error("Event not found.");
    }

    return updatedEvent;
  });
}

export async function deleteEventItem(input: {
  userId: string;
  eventId: string;
  itemId: string;
}) {
  const event = await getOwnedEventOrThrow(input.eventId, input.userId);
  const item = event.items.find((candidate) => candidate.id === input.itemId);

  if (!item) {
    throw new Error("Item not found.");
  }

  return db.transaction(async (tx) => {
    await deleteSetlistItemRecord(input.itemId, tx);

    const remainingItems = event.items
      .filter((candidate) => candidate.id !== input.itemId)
      .sort((left, right) => left.position - right.position);

    await reorderSetlistItems(
      input.eventId,
      remainingItems.map((candidate) => candidate.id),
      tx,
    );

    const updatedEvent = await findEventWithItemsById(input.eventId, tx);

    if (!updatedEvent) {
      throw new Error("Event not found.");
    }

    return updatedEvent;
  });
}

export async function deleteEvent(input: {
  userId: string;
  eventId: string;
}) {
  const event = await getOwnedEventOrThrow(input.eventId, input.userId);

  return db.transaction(async (tx) => {
    const deletedEvent = await deleteEventRecord(input.eventId, tx);

    if (!deletedEvent) {
      throw new Error("Event not found.");
    }

    return event;
  });
}

export async function reorderEventItems(input: {
  userId: string;
  eventId: string;
  orderedItemIds: string[];
}) {
  const event = await getOwnedEventOrThrow(input.eventId, input.userId);
  const existingIds = event.items.map((item) => item.id).sort();
  const proposedIds = [...input.orderedItemIds].sort();

  if (
    input.orderedItemIds.length !== event.items.length ||
    existingIds.some((itemId, index) => itemId !== proposedIds[index])
  ) {
    throw new Error("Ordered item ids must match the event items exactly.");
  }

  return db.transaction(async (tx) => {
    await reorderSetlistItems(input.eventId, input.orderedItemIds, tx);

    const updatedEvent = await findEventWithItemsById(input.eventId, tx);

    if (!updatedEvent) {
      throw new Error("Event not found.");
    }

    return updatedEvent;
  });
}

export async function duplicateEvent(input: {
  userId: string;
  eventId: string;
}) {
  const event = await getOwnedEventOrThrow(input.eventId, input.userId);

  return db.transaction(async (tx) => {
    const duplicatedEvent = await createEventRecord(
      {
        id: crypto.randomUUID(),
        ownerUserId: input.userId,
        title: `${event.title} (コピー)`,
        venue: event.venue,
        theme: normalizeTheme(event.theme),
        eventDate: event.eventDate,
        notes: event.notes,
      },
      tx,
    );

    await createSetlistItems(
      event.items.map((item, index) => ({
        id: crypto.randomUUID(),
        eventId: duplicatedEvent.id,
        position: index + 1,
        itemType: item.itemType,
        title: item.title,
        artist: item.artist,
        durationSeconds: item.durationSeconds,
        notes: item.notes,
      })),
      tx,
    );

    const duplicatedGraph = await findEventWithItemsById(duplicatedEvent.id, tx);

    if (!duplicatedGraph) {
      throw new Error("Failed to duplicate event.");
    }

    return duplicatedGraph;
  });
}

export async function getEventForUser(input: {
  userId: string;
  eventId: string;
}): Promise<EventWithItems> {
  return getOwnedEventOrThrow(input.eventId, input.userId);
}
