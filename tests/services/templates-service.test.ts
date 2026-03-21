import { afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  account,
  events,
  session,
  setlistItems,
  subscription,
  templateItems,
  templates,
  user,
  verification,
} from "../../lib/db/schema";
import { db, dbReady } from "../../lib/db/client";
import { createEvent } from "../../lib/services/events-service";
import {
  createEventFromTemplate,
  saveTemplate,
} from "../../lib/services/templates-service";
import { nagoyaRadhallEvent } from "../fixtures/nagoya-radhall-event";

async function createUser(name: string) {
  const id = crypto.randomUUID();

  await db.insert(user).values({
    id,
    email: `${id}@example.com`,
    name,
    emailVerified: true,
  });

  return { id, name };
}

beforeAll(async () => {
  await dbReady;
});

afterEach(async () => {
  await db.delete(templateItems);
  await db.delete(templates);
  await db.delete(setlistItems);
  await db.delete(events);
  await db.delete(subscription);
  await db.delete(account);
  await db.delete(session);
  await db.delete(verification);
  await db.delete(user);
});

describe("templates service", () => {
  it("rejects template save for free users", async () => {
    const owner = await createUser("Free Owner");
    const sourceEvent = await createEvent({
      userId: owner.id,
      ...nagoyaRadhallEvent,
    });

    await expect(
      saveTemplate({
        userId: owner.id,
        sourceEventId: sourceEvent.id,
        name: "RADHALL basic set",
        plan: "free",
      }),
    ).rejects.toThrow("Pro plan required");
  });

  it("allows template save for active pro users", async () => {
    const owner = await createUser("Pro Owner");
    const sourceEvent = await createEvent({
      userId: owner.id,
      ...nagoyaRadhallEvent,
    });

    const template = await saveTemplate({
      userId: owner.id,
      sourceEventId: sourceEvent.id,
      name: "RADHALL basic set",
      plan: "pro",
    });

    expect(template.name).toBe("RADHALL basic set");
    expect(template.items.map((item) => item.title)).toEqual(
      sourceEvent.items.map((item) => item.title),
    );
    expect(template.items.map((item) => item.itemType)).toEqual(
      sourceEvent.items.map((item) => item.itemType),
    );
  });

  it("lets users create new events from an owned template regardless of plan", async () => {
    const owner = await createUser("Template Owner");
    const sourceEvent = await createEvent({
      userId: owner.id,
      ...nagoyaRadhallEvent,
    });

    const template = await saveTemplate({
      userId: owner.id,
      sourceEventId: sourceEvent.id,
      name: "Encore set",
      plan: "pro",
    });

    const recreatedEvent = await createEventFromTemplate({
      userId: owner.id,
      templateId: template.id,
      title: "2026.04.12 渋谷 O-WEST",
      plan: "free",
    });

    expect(recreatedEvent.title).toBe("2026.04.12 渋谷 O-WEST");
    expect(recreatedEvent.items.map((item) => item.title)).toEqual(
      template.items.map((item) => item.title),
    );
  });
});
