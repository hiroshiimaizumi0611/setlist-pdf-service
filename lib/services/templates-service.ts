import { db } from "../db/client";
import { findEventWithItemsById } from "../repositories/event-repository";
import {
  createTemplateItems,
  createTemplateRecord,
  findTemplateWithItemsById,
  listTemplatesByOwnerUserId,
} from "../repositories/template-repository";
import { createEvent, type EventMetadataInput } from "./events-service";
import type { AppPlan } from "../stripe/plans";

function normalizeNullableText(value?: string | null) {
  return value?.trim() ? value.trim() : null;
}

function normalizeName(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error("Template name is required.");
  }

  return normalized;
}

async function getOwnedEventOrThrow(eventId: string, userId: string) {
  const event = await findEventWithItemsById(eventId);

  if (!event || event.ownerUserId !== userId) {
    throw new Error("Event not found.");
  }

  return event;
}

async function getOwnedTemplateOrThrow(templateId: string, userId: string) {
  const template = await findTemplateWithItemsById(templateId);

  if (!template || template.ownerUserId !== userId) {
    throw new Error("Template not found.");
  }

  return template;
}

export async function listTemplates(input: { userId: string }) {
  return listTemplatesByOwnerUserId(input.userId);
}

export async function saveTemplate(input: {
  userId: string;
  sourceEventId: string;
  name: string;
  description?: string | null;
  plan: AppPlan;
}) {
  if (input.plan !== "pro") {
    throw new Error("Pro plan required");
  }

  const event = await getOwnedEventOrThrow(input.sourceEventId, input.userId);
  const templateId = crypto.randomUUID();

  return db.transaction(async (tx) => {
    await createTemplateRecord(
      {
        id: templateId,
        ownerUserId: input.userId,
        name: normalizeName(input.name),
        description: normalizeNullableText(input.description),
      },
      tx,
    );

    await createTemplateItems(
      event.items.map((item, index) => ({
        id: crypto.randomUUID(),
        templateId,
        position: index + 1,
        itemType: item.itemType,
        title: item.title,
        artist: item.artist,
        durationSeconds: item.durationSeconds,
        notes: item.notes,
      })),
      tx,
    );

    const template = await findTemplateWithItemsById(templateId, tx);

    if (!template) {
      throw new Error("Failed to save template.");
    }

    return template;
  });
}

export async function createEventFromTemplate(
  input: {
    userId: string;
    templateId: string;
    plan?: AppPlan;
  } & EventMetadataInput,
) {
  const template = await getOwnedTemplateOrThrow(input.templateId, input.userId);

  return createEvent({
    userId: input.userId,
    title: input.title,
    venue: input.venue,
    eventDate: input.eventDate,
    notes: input.notes,
    items: template.items.map((item) => ({
      itemType: item.itemType,
      title: item.title,
      artist: item.artist,
      durationSeconds: item.durationSeconds,
      notes: item.notes,
    })),
  });
}

export const saveTemplateFromEvent = saveTemplate;
