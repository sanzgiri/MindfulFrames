import {
  users,
  pauses,
  activities,
  userProgress,
  journalEntries,
  photos,
  locations,
  photographers,
  type User,
  type UpsertUser,
  type Pause,
  type Activity,
  type UserProgress,
  type JournalEntry,
  type InsertJournalEntry,
  type Photo,
  type InsertPhoto,
  type Location,
  type Photographer,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserSettings(id: string, settings: { startDate?: Date; locationPreference?: string }): Promise<User>;
  
  // Pause operations
  getAllPauses(): Promise<Pause[]>;
  getPause(id: number): Promise<Pause | undefined>;
  
  // Activity operations
  getActivitiesByPause(pauseId: number): Promise<Activity[]>;
  
  // User progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  updateProgress(userId: string, activityId: number, completed: boolean): Promise<UserProgress>;
  
  // Journal operations
  getUserJournalEntries(userId: string, pauseId?: number): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, content: string): Promise<JournalEntry>;
  
  // Photo operations
  getUserPhotos(userId: string, pauseId?: number): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: number, userId: string): Promise<void>;
  
  // Location operations
  getLocationsByPause(pauseId: number, locationType?: string): Promise<Location[]>;
  
  // Photographer operations
  getPhotographersByPause(pauseId: number): Promise<Photographer[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserSettings(id: string, settings: { startDate?: Date; locationPreference?: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Pause operations
  async getAllPauses(): Promise<Pause[]> {
    return await db.select().from(pauses).orderBy(pauses.weekNumber);
  }

  async getPause(id: number): Promise<Pause | undefined> {
    const [pause] = await db.select().from(pauses).where(eq(pauses.id, id));
    return pause;
  }

  // Activity operations
  async getActivitiesByPause(pauseId: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.pauseId, pauseId))
      .orderBy(activities.orderIndex);
  }

  // User progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
  }

  async updateProgress(userId: string, activityId: number, completed: boolean): Promise<UserProgress> {
    const existing = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.activityId, activityId)
        )
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(userProgress)
        .set({
          completed,
          completedAt: completed ? new Date() : null,
        })
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.activityId, activityId)
          )
        )
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values({
          userId,
          activityId,
          completed,
          completedAt: completed ? new Date() : null,
        })
        .returning();
      return created;
    }
  }

  // Journal operations
  async getUserJournalEntries(userId: string, pauseId?: number): Promise<JournalEntry[]> {
    if (pauseId) {
      return await db
        .select()
        .from(journalEntries)
        .where(
          and(
            eq(journalEntries.userId, userId),
            eq(journalEntries.pauseId, pauseId)
          )
        )
        .orderBy(desc(journalEntries.createdAt));
    }
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [created] = await db
      .insert(journalEntries)
      .values(entry)
      .returning();
    return created;
  }

  async updateJournalEntry(id: number, content: string): Promise<JournalEntry> {
    const [updated] = await db
      .update(journalEntries)
      .set({ content, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();
    return updated;
  }

  // Photo operations
  async getUserPhotos(userId: string, pauseId?: number): Promise<Photo[]> {
    if (pauseId) {
      return await db
        .select()
        .from(photos)
        .where(
          and(
            eq(photos.userId, userId),
            eq(photos.pauseId, pauseId)
          )
        )
        .orderBy(desc(photos.createdAt));
    }
    return await db
      .select()
      .from(photos)
      .where(eq(photos.userId, userId))
      .orderBy(desc(photos.createdAt));
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const [created] = await db
      .insert(photos)
      .values(photo)
      .returning();
    return created;
  }

  async deletePhoto(id: number, userId: string): Promise<void> {
    await db
      .delete(photos)
      .where(
        and(
          eq(photos.id, id),
          eq(photos.userId, userId)
        )
      );
  }

  // Location operations
  async getLocationsByPause(pauseId: number, locationType?: string): Promise<Location[]> {
    if (locationType) {
      return await db
        .select()
        .from(locations)
        .where(
          and(
            eq(locations.pauseId, pauseId),
            eq(locations.locationType, locationType)
          )
        );
    }
    return await db
      .select()
      .from(locations)
      .where(eq(locations.pauseId, pauseId));
  }

  // Photographer operations
  async getPhotographersByPause(pauseId: number): Promise<Photographer[]> {
    return await db
      .select()
      .from(photographers)
      .where(eq(photographers.pauseId, pauseId));
  }
}

export const storage = new DatabaseStorage();
