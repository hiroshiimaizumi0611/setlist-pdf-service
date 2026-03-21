import { asc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { templateItems, templates } from "../db/schema";

type TransactionCallback = Parameters<typeof db.transaction>[0];
export type TemplateDatabase = typeof db | Parameters<TransactionCallback>[0];
export type TemplateRecord = typeof templates.$inferSelect;
export type TemplateInsert = typeof templates.$inferInsert;
export type TemplateItemRecord = typeof templateItems.$inferSelect;
export type TemplateItemInsert = typeof templateItems.$inferInsert;
export type TemplateWithItems = TemplateRecord & { items: TemplateItemRecord[] };

function resolveExecutor(executor?: TemplateDatabase) {
  return executor ?? db;
}

export async function createTemplateRecord(
  values: TemplateInsert,
  executor?: TemplateDatabase,
) {
  const database = resolveExecutor(executor);
  const [template] = await database.insert(templates).values(values).returning();

  return template;
}

export async function createTemplateItems(
  values: TemplateItemInsert[],
  executor?: TemplateDatabase,
) {
  if (values.length === 0) {
    return [];
  }

  const database = resolveExecutor(executor);
  return database.insert(templateItems).values(values).returning();
}

export async function findTemplateById(
  templateId: string,
  executor?: TemplateDatabase,
) {
  const database = resolveExecutor(executor);
  const [template] = await database
    .select()
    .from(templates)
    .where(eq(templates.id, templateId))
    .limit(1);

  return template ?? null;
}

export async function findTemplateItemsByTemplateId(
  templateId: string,
  executor?: TemplateDatabase,
) {
  const database = resolveExecutor(executor);
  return database
    .select()
    .from(templateItems)
    .where(eq(templateItems.templateId, templateId))
    .orderBy(asc(templateItems.position));
}

export async function findTemplateWithItemsById(
  templateId: string,
  executor?: TemplateDatabase,
): Promise<TemplateWithItems | null> {
  const template = await findTemplateById(templateId, executor);

  if (!template) {
    return null;
  }

  const items = await findTemplateItemsByTemplateId(templateId, executor);

  return {
    ...template,
    items,
  };
}

export async function listTemplatesByOwnerUserId(
  ownerUserId: string,
  executor?: TemplateDatabase,
) {
  const database = resolveExecutor(executor);
  const ownedTemplates = await database
    .select()
    .from(templates)
    .where(eq(templates.ownerUserId, ownerUserId))
    .orderBy(asc(templates.name));

  return Promise.all(
    ownedTemplates.map(async (template) => ({
      ...template,
      items: await findTemplateItemsByTemplateId(template.id, executor),
    })),
  );
}
