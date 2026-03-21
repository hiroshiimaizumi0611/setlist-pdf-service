import { asc, count, desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { events, setlistItems } from "../db/schema";

type TransactionCallback = Parameters<typeof db.transaction>[0];
export type EventDatabase = typeof db | Parameters<TransactionCallback>[0];
export type EventRecord = typeof events.$inferSelect;
export type EventInsert = typeof events.$inferInsert;
export type EventUpdate = Partial<Omit<typeof events.$inferInsert, "id" | "ownerUserId">>;
export type SetlistItemRecord = typeof setlistItems.$inferSelect;
export type SetlistItemInsert = typeof setlistItems.$inferInsert;
export type SetlistItemUpdate = Partial<
  Omit<typeof setlistItems.$inferInsert, "id" | "eventId" | "position">
>;
export type EventWithItems = EventRecord & { items: SetlistItemRecord[] };
export type EventSummary = EventRecord & { itemCount: number };

function resolveExecutor(executor?: EventDatabase) {
  return executor ?? db;
}

export async function createEventRecord(values: EventInsert, executor?: EventDatabase) {
  const database = resolveExecutor(executor);
  const [event] = await database.insert(events).values(values).returning();

  return event;
}

export async function createSetlistItems(
  values: SetlistItemInsert[],
  executor?: EventDatabase,
) {
  if (values.length === 0) {
    return [];
  }

  const database = resolveExecutor(executor);
  return database.insert(setlistItems).values(values).returning();
}

export async function findEventById(eventId: string, executor?: EventDatabase) {
  const database = resolveExecutor(executor);
  const [event] = await database
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  return event ?? null;
}

export async function findSetlistItemsByEventId(
  eventId: string,
  executor?: EventDatabase,
) {
  const database = resolveExecutor(executor);
  return database
    .select()
    .from(setlistItems)
    .where(eq(setlistItems.eventId, eventId))
    .orderBy(asc(setlistItems.position));
}

export async function findEventWithItemsById(
  eventId: string,
  executor?: EventDatabase,
): Promise<EventWithItems | null> {
  const event = await findEventById(eventId, executor);

  if (!event) {
    return null;
  }

  const items = await findSetlistItemsByEventId(eventId, executor);
  return {
    ...event,
    items,
  };
}

export async function listEventSummariesByOwnerUserId(
  ownerUserId: string,
  executor?: EventDatabase,
) : Promise<EventSummary[]> {
  const database = resolveExecutor(executor);
  return database
    .select({
      id: events.id,
      ownerUserId: events.ownerUserId,
      title: events.title,
      venue: events.venue,
      eventDate: events.eventDate,
      notes: events.notes,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      itemCount: count(setlistItems.id),
    })
    .from(events)
    .leftJoin(setlistItems, eq(setlistItems.eventId, events.id))
    .where(eq(events.ownerUserId, ownerUserId))
    .groupBy(events.id)
    .orderBy(desc(events.updatedAt), desc(events.eventDate), asc(events.title));
}

export async function updateEventRecord(
  eventId: string,
  values: EventUpdate,
  executor?: EventDatabase,
) {
  const database = resolveExecutor(executor);
  const [event] = await database
    .update(events)
    .set(values)
    .where(eq(events.id, eventId))
    .returning();

  return event ?? null;
}

export async function findSetlistItemById(
  itemId: string,
  executor?: EventDatabase,
) {
  const database = resolveExecutor(executor);
  const [item] = await database
    .select()
    .from(setlistItems)
    .where(eq(setlistItems.id, itemId))
    .limit(1);

  return item ?? null;
}

export async function findLastSetlistItem(
  eventId: string,
  executor?: EventDatabase,
) {
  const database = resolveExecutor(executor);
  const [item] = await database
    .select()
    .from(setlistItems)
    .where(eq(setlistItems.eventId, eventId))
    .orderBy(desc(setlistItems.position))
    .limit(1);

  return item ?? null;
}

export async function createSetlistItem(
  values: SetlistItemInsert,
  executor?: EventDatabase,
) {
  const database = resolveExecutor(executor);
  const [item] = await database.insert(setlistItems).values(values).returning();

  return item;
}

export async function updateSetlistItemRecord(
  itemId: string,
  values: SetlistItemUpdate,
  executor?: EventDatabase,
) {
  const database = resolveExecutor(executor);
  const [item] = await database
    .update(setlistItems)
    .set(values)
    .where(eq(setlistItems.id, itemId))
    .returning();

  return item ?? null;
}

export async function deleteSetlistItemRecord(
  itemId: string,
  executor?: EventDatabase,
) {
  const database = resolveExecutor(executor);
  const [item] = await database
    .delete(setlistItems)
    .where(eq(setlistItems.id, itemId))
    .returning();

  return item ?? null;
}

export async function reorderSetlistItems(
  eventId: string,
  orderedItemIds: string[],
  executor?: EventDatabase,
) {
  const database = resolveExecutor(executor);
  const lastItem = await findLastSetlistItem(eventId, executor);
  const temporaryOffset = (lastItem?.position ?? 0) + orderedItemIds.length + 1;

  for (const [index, itemId] of orderedItemIds.entries()) {
    await database
      .update(setlistItems)
      .set({ position: index + temporaryOffset })
      .where(eq(setlistItems.id, itemId));
  }

  for (const [index, itemId] of orderedItemIds.entries()) {
    await database
      .update(setlistItems)
      .set({
        position: index + 1,
        updatedAt: new Date(),
      })
      .where(eq(setlistItems.id, itemId));
  }

  return findSetlistItemsByEventId(eventId, executor);
}
