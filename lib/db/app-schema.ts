import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export const setlistItemTypes = [
  "song",
  "mc",
  "transition",
  "heading",
] as const;

export const events = sqliteTable(
  "events",
  {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    venue: text("venue"),
    eventDate: integer("event_date", { mode: "timestamp_ms" }),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("events_owner_user_id_idx").on(table.ownerUserId),
    index("events_event_date_idx").on(table.eventDate),
  ],
);

export const setlistItems = sqliteTable(
  "setlist_items",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    itemType: text("item_type", { enum: setlistItemTypes })
      .notNull()
      .default("song"),
    title: text("title").notNull(),
    artist: text("artist"),
    durationSeconds: integer("duration_seconds"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("setlist_items_event_id_idx").on(table.eventId),
    uniqueIndex("setlist_items_event_position_idx").on(table.eventId, table.position),
  ],
);

export const templates = sqliteTable(
  "templates",
  {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [index("templates_owner_user_id_idx").on(table.ownerUserId)],
);

export const templateItems = sqliteTable(
  "template_items",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    itemType: text("item_type", { enum: setlistItemTypes })
      .notNull()
      .default("song"),
    title: text("title").notNull(),
    artist: text("artist"),
    durationSeconds: integer("duration_seconds"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("template_items_template_id_idx").on(table.templateId),
    uniqueIndex("template_items_template_position_idx").on(
      table.templateId,
      table.position,
    ),
  ],
);

export const eventsRelations = relations(events, ({ many }) => ({
  setlistItems: many(setlistItems),
}));

export const setlistItemsRelations = relations(setlistItems, ({ one }) => ({
  event: one(events, {
    fields: [setlistItems.eventId],
    references: [events.id],
  }),
}));

export const templatesRelations = relations(templates, ({ many }) => ({
  templateItems: many(templateItems),
}));

export const templateItemsRelations = relations(templateItems, ({ one }) => ({
  template: one(templates, {
    fields: [templateItems.templateId],
    references: [templates.id],
  }),
}));
