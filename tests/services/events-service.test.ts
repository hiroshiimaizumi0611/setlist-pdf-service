import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { account, events, session, setlistItems, templateItems, templates, user, verification } from "../../lib/db/schema";
import { db, dbReady } from "../../lib/db/client";
import { buildRenderableItems } from "../../lib/setlist/build-renderable-items";
import {
  addEventItem,
  createEvent,
  deleteEventItem,
  duplicateEvent,
  reorderEventItems,
  updateEventItem,
  updateEventMetadata,
} from "../../lib/services/events-service";
import { nagoyaRadhallEvent } from "../fixtures/nagoya-radhall-event";

async function createUser(name: string) {
  const id = crypto.randomUUID();
  const email = `${id}@example.com`;

  await db.insert(user).values({
    id,
    email,
    name,
    emailVerified: true,
  });

  return { id, email, name };
}

async function createFixtureEvent(userId: string) {
  return createEvent({
    userId,
    ...nagoyaRadhallEvent,
  });
}

beforeAll(async () => {
  await dbReady;
});

afterEach(async () => {
  await db.delete(templateItems);
  await db.delete(templates);
  await db.delete(setlistItems);
  await db.delete(events);
  await db.delete(account);
  await db.delete(session);
  await db.delete(verification);
  await db.delete(user);
});

describe("events service", () => {
  it("creates an event with ordered setlist items", async () => {
    const owner = await createUser("Owner");

    const event = await createEvent({
      userId: owner.id,
      ...nagoyaRadhallEvent,
    });

    expect(event.title).toBe("2026.03.28 名古屋 RADHALL");
    expect(event.items).toHaveLength(8);
    expect(event.items.map((item) => item.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(event.items.map((item) => item.itemType)).toEqual([
      "song",
      "song",
      "song",
      "mc",
      "song",
      "song",
      "transition",
      "heading",
    ]);
  });

  it("reorders items by the provided id list", async () => {
    const owner = await createUser("Reorder Owner");
    const event = await createFixtureEvent(owner.id);

    const reordered = await reorderEventItems({
      userId: owner.id,
      eventId: event.id,
      orderedItemIds: [
        event.items[2].id,
        event.items[0].id,
        event.items[1].id,
        event.items[3].id,
        event.items[4].id,
        event.items[5].id,
        event.items[6].id,
        event.items[7].id,
      ],
    });

    expect(reordered.items.map((item) => item.title)).toEqual([
      "Dendrobium",
      "緑",
      "ねえ！もう実験は終わりにしよう！",
      "MC",
      "いちごジャムにチーズ",
      "純闇Dinner",
      "転換",
      "EN",
    ]);
    expect(reordered.items.map((item) => item.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("duplicates an event with ordered items intact", async () => {
    const owner = await createUser("Dup Owner");
    const original = await createFixtureEvent(owner.id);

    const duplicated = await duplicateEvent({
      userId: owner.id,
      eventId: original.id,
    });

    expect(duplicated.id).not.toBe(original.id);
    expect(duplicated.items.map((item) => item.title)).toEqual(
      original.items.map((item) => item.title),
    );
    expect(duplicated.items.map((item) => item.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("reorders large events without temporary position collisions", async () => {
    const owner = await createUser("Large Reorder Owner");
    const largeEvent = await createEvent({
      userId: owner.id,
      title: "Long Set",
      items: Array.from({ length: 1001 }, (_, index) => ({
        itemType: "song" as const,
        title: `Song ${index + 1}`,
      })),
    });

    const reordered = await reorderEventItems({
      userId: owner.id,
      eventId: largeEvent.id,
      orderedItemIds: [...largeEvent.items].reverse().map((item) => item.id),
    });

    expect(reordered.items[0].title).toBe("Song 1001");
    expect(reordered.items.at(-1)?.title).toBe("Song 1");
    expect(reordered.items.at(-1)?.position).toBe(1001);
  }, 20_000);

  it("updates metadata and preserves ownership", async () => {
    const owner = await createUser("Metadata Owner");
    const event = await createFixtureEvent(owner.id);

    const updated = await updateEventMetadata({
      userId: owner.id,
      eventId: event.id,
      title: "2026.03.28 名古屋 RADHALL 第二部",
      venue: "RADHALL",
      eventDate: new Date("2026-03-28T10:00:00.000Z"),
      notes: "開場押し対応版",
    });

    expect(updated.title).toBe("2026.03.28 名古屋 RADHALL 第二部");
    expect(updated.notes).toBe("開場押し対応版");
    expect(updated.ownerUserId).toBe(owner.id);
  });

  it("adds, updates, and deletes items while keeping positions contiguous", async () => {
    const owner = await createUser("Mutator Owner");
    const event = await createFixtureEvent(owner.id);

    const withAddedItem = await addEventItem({
      userId: owner.id,
      eventId: event.id,
      itemType: "song",
      title: "新曲",
    });

    expect(withAddedItem.items.at(-1)?.title).toBe("新曲");
    expect(withAddedItem.items.at(-1)?.position).toBe(9);

    const itemToEdit = withAddedItem.items[3];
    const withUpdatedItem = await updateEventItem({
      userId: owner.id,
      eventId: event.id,
      itemId: itemToEdit.id,
      itemType: "heading",
      title: "SE",
    });

    expect(withUpdatedItem.items[3].itemType).toBe("heading");
    expect(withUpdatedItem.items[3].title).toBe("SE");

    const itemToDelete = withUpdatedItem.items[1];
    const withDeletedItem = await deleteEventItem({
      userId: owner.id,
      eventId: event.id,
      itemId: itemToDelete.id,
    });

    expect(withDeletedItem.items).toHaveLength(8);
    expect(withDeletedItem.items.map((item) => item.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(withDeletedItem.items.some((item) => item.id === itemToDelete.id)).toBe(false);
  });

  it("rejects duplication for a user who does not own the event", async () => {
    const owner = await createUser("Owner");
    const intruder = await createUser("Intruder");
    const original = await createFixtureEvent(owner.id);

    await expect(
      duplicateEvent({
        userId: intruder.id,
        eventId: original.id,
      }),
    ).rejects.toThrow("Event not found");
  });

  it("numbers only song rows", () => {
    const rows = buildRenderableItems([
      { id: "item-1", itemType: "song", position: 1, title: "緑" },
      { id: "item-2", itemType: "mc", position: 2, title: "MC" },
      { id: "item-3", itemType: "song", position: 3, title: "Dendrobium" },
      { id: "item-4", itemType: "heading", position: 4, title: "EN" },
    ]);

    expect(rows.map((row) => row.label)).toEqual(["M01", null, "M02", null]);
  });
});
