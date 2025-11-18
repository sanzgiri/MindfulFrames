import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  boolean,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  startDate: timestamp("start_date"),
  locationPreference: varchar("location_preference", { length: 50 }).default('portland'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pauses = pgTable("pauses", {
  id: integer("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  theme: text("theme").notNull(),
  description: text("description"),
  weekNumber: integer("week_number").notNull(),
  spotifyPlaylistUrl: text("spotify_playlist_url"),
  spotifyDescription: text("spotify_description"),
});

export const activities = pgTable("activities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  pauseId: integer("pause_id").notNull().references(() => pauses.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  duration: varchar("duration", { length: 50 }),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // 'meditation', 'project', 'micro-practice'
  orderIndex: integer("order_index").default(0),
});

export const userProgress = pgTable("user_progress", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  activityId: integer("activity_id").notNull().references(() => activities.id, { onDelete: 'cascade' }),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
});

export const journalEntries = pgTable("journal_entries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  pauseId: integer("pause_id").notNull().references(() => pauses.id, { onDelete: 'cascade' }),
  activityId: integer("activity_id").references(() => activities.id, { onDelete: 'cascade' }),
  prompt: text("prompt"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const photos = pgTable("photos", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  pauseId: integer("pause_id").notNull().references(() => pauses.id, { onDelete: 'cascade' }),
  activityId: integer("activity_id").references(() => activities.id, { onDelete: 'cascade' }),
  objectPath: varchar("object_path", { length: 500 }).notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const locations = pgTable("locations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  pauseId: integer("pause_id").notNull().references(() => pauses.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  address: text("address"),
  locationType: varchar("location_type", { length: 50 }).default('portland'), // 'portland' or 'murrayhill'
});

export const photographers = pgTable("photographers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  pauseId: integer("pause_id").notNull().references(() => pauses.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  externalLink: text("external_link"),
  sampleImages: jsonb("sample_images"), // array of image URLs
});

// Relations
export const pausesRelations = relations(pauses, ({ many }) => ({
  activities: many(activities),
  journalEntries: many(journalEntries),
  photos: many(photos),
  locations: many(locations),
  photographers: many(photographers),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  pause: one(pauses, {
    fields: [activities.pauseId],
    references: [pauses.id],
  }),
  userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  activity: one(activities, {
    fields: [userProgress.activityId],
    references: [activities.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
  pause: one(pauses, {
    fields: [journalEntries.pauseId],
    references: [pauses.id],
  }),
  activity: one(activities, {
    fields: [journalEntries.activityId],
    references: [activities.id],
  }),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  user: one(users, {
    fields: [photos.userId],
    references: [users.id],
  }),
  pause: one(pauses, {
    fields: [photos.pauseId],
    references: [pauses.id],
  }),
  activity: one(activities, {
    fields: [photos.activityId],
    references: [activities.id],
  }),
}));

export const locationsRelations = relations(locations, ({ one }) => ({
  pause: one(pauses, {
    fields: [locations.pauseId],
    references: [pauses.id],
  }),
}));

export const photographersRelations = relations(photographers, ({ one }) => ({
  pause: one(pauses, {
    fields: [photographers.pauseId],
    references: [pauses.id],
  }),
}));

// Insert schemas
export const upsertUserSchema = z.object({
  id: z.string(),
  email: z.string().email().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  profileImageUrl: z.string().nullable().optional(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  pauseId: true,
  activityId: true,
  prompt: true,
  content: true,
});

export const insertPhotoSchema = createInsertSchema(photos).pick({
  userId: true,
  pauseId: true,
  activityId: true,
  objectPath: true,
  caption: true,
});

export const updateUserProgressSchema = z.object({
  activityId: z.number(),
  completed: z.boolean(),
});

export const updateUserSettingsSchema = z.object({
  startDate: z.string().optional(),
  locationPreference: z.enum(['portland', 'murrayhill']).optional(),
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Pause = typeof pauses.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Location = typeof locations.$inferSelect;
export type Photographer = typeof photographers.$inferSelect;
