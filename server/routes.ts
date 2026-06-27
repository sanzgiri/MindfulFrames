import type { Express, RequestHandler } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError, ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "./objectStorage";
import {
  insertJournalEntrySchema,
  insertPhotoSchema,
  updateUserProgressSchema,
  updateUserSettingsSchema,
} from "@shared/schema";

// Single shared user for the app - all sessions use the same user
const SHARED_USER_ID = "main-user";

const VALID_LOCATIONS = ["portland", "murrayhill"] as const;
type LocationType = (typeof VALID_LOCATIONS)[number];

/**
 * Parse a route param as a positive integer id.
 * Returns null for anything that isn't a valid id (e.g. "abc", "-1", "1.5").
 */
function parseId(raw: string): number | null {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

/**
 * Parse an optional ?pauseId= query value. Invalid values are treated as
 * "not provided" (undefined) rather than producing NaN.
 */
function parsePauseIdQuery(raw: unknown): number | undefined {
  if (typeof raw !== "string" || raw === "") return undefined;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

/**
 * Minimal in-memory rate limiter for the unauthenticated upload-URL endpoint.
 * Keyed by client IP; allows MAX_REQ requests per WINDOW_MS window. Good enough
 * for a single-user personal app to avoid runaway storage-cost abuse.
 */
const WINDOW_MS = 60_000;
const MAX_REQ = 30;
const hits = new Map<string, { count: number; resetAt: number }>();
const uploadRateLimiter: RequestHandler = (req, res, next) => {
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }
  if (entry.count >= MAX_REQ) {
    return res.status(429).json({ message: "Too many upload requests, slow down." });
  }
  entry.count += 1;
  next();
};

/**
 * Resolve which location version to show. An explicit, valid ?locationType=
 * query param wins; otherwise fall back to the shared user's saved preference;
 * otherwise default to portland.
 */
async function resolveLocationType(rawQuery: unknown): Promise<LocationType> {
  if (typeof rawQuery === "string" && (VALID_LOCATIONS as readonly string[]).includes(rawQuery)) {
    return rawQuery as LocationType;
  }
  const user = await storage.getUser(SHARED_USER_ID);
  const pref = user?.locationPreference;
  if (pref && (VALID_LOCATIONS as readonly string[]).includes(pref)) {
    return pref as LocationType;
  }
  return "portland";
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes - return the single shared user
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Disable caching for user data
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      let user = await storage.getUser(SHARED_USER_ID);
      if (!user) {
        // Create the main user if it doesn't exist
        await storage.upsertUser({
          id: SHARED_USER_ID,
          email: "user@mindfulframes.app",
          firstName: "Mindful",
          lastName: "User",
          profileImageUrl: null,
        });
        user = await storage.getUser(SHARED_USER_ID);
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User settings
  app.put('/api/user/settings', async (req: any, res) => {
    try {
      const userId = SHARED_USER_ID;
      const validated = updateUserSettingsSchema.parse(req.body);

      const settings: { startDate?: Date; locationPreference?: string } = {};
      if (validated.startDate) {
        settings.startDate = new Date(validated.startDate);
      }
      if (validated.locationPreference) {
        settings.locationPreference = validated.locationPreference;
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('Updating settings for user:', userId, settings);
      }
      const user = await storage.updateUserSettings(userId, settings);
      res.json(user);
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });

  // Pauses routes
  app.get('/api/pauses', async (req, res) => {
    try {
      const pauses = await storage.getAllPauses();
      res.json(pauses);
    } catch (error) {
      console.error("Error fetching pauses:", error);
      res.status(500).json({ message: "Failed to fetch pauses" });
    }
  });

  app.get('/api/pauses/:id', async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid pause id" });
      }
      const pause = await storage.getPause(id);
      if (!pause) {
        return res.status(404).json({ message: "Pause not found" });
      }

      const locationType = await resolveLocationType(req.query.locationType);
      const activities = await storage.getActivitiesByPause(id);
      const locations = await storage.getLocationsByPause(id, locationType);
      const photographers = await storage.getPhotographersByPause(id);

      res.json({ ...pause, activities, locations, photographers });
    } catch (error) {
      console.error("Error fetching pause:", error);
      res.status(500).json({ message: "Failed to fetch pause" });
    }
  });

  // Activities routes
  app.get('/api/activities', async (req, res) => {
    try {
      const allActivities = await storage.getAllActivities();
      res.json(allActivities);
    } catch (error) {
      console.error("Error fetching all activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get('/api/pauses/:pauseId/activities', async (req, res) => {
    try {
      const pauseId = parseId(req.params.pauseId);
      if (pauseId === null) {
        return res.status(400).json({ message: "Invalid pause id" });
      }
      const activities = await storage.getActivitiesByPause(pauseId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Locations routes
  app.get('/api/pauses/:pauseId/locations', async (req, res) => {
    try {
      const pauseId = parseId(req.params.pauseId);
      if (pauseId === null) {
        return res.status(400).json({ message: "Invalid pause id" });
      }
      const locationType = await resolveLocationType(req.query.locationType);
      const locations = await storage.getLocationsByPause(pauseId, locationType);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Photographers routes
  app.get('/api/pauses/:pauseId/photographers', async (req, res) => {
    try {
      const pauseId = parseId(req.params.pauseId);
      if (pauseId === null) {
        return res.status(400).json({ message: "Invalid pause id" });
      }
      const photographers = await storage.getPhotographersByPause(pauseId);
      res.json(photographers);
    } catch (error) {
      console.error("Error fetching photographers:", error);
      res.status(500).json({ message: "Failed to fetch photographers" });
    }
  });

  // User progress routes
  app.get('/api/user/progress', async (req: any, res) => {
    try {
      const userId = SHARED_USER_ID;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.put('/api/user/progress', async (req: any, res) => {
    try {
      const userId = SHARED_USER_ID;
      const validated = updateUserProgressSchema.parse(req.body);
      
      const updated = await storage.updateProgress(
        userId,
        validated.activityId,
        validated.completed
      );
      res.json(updated);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Journal entries routes
  app.get('/api/journal', async (req: any, res) => {
    try {
      const userId = SHARED_USER_ID;
      const pauseId = parsePauseIdQuery(req.query.pauseId);
      const entries = await storage.getUserJournalEntries(userId, pauseId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post('/api/journal', async (req: any, res) => {
    try {
      const userId = SHARED_USER_ID;
      const validated = insertJournalEntrySchema.parse({
        ...req.body,
        userId,
      });
      
      const entry = await storage.createJournalEntry(validated as any);
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.put('/api/journal/:id', async (req: any, res) => {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid journal entry id" });
      }
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      const updated = await storage.updateJournalEntry(id, content);
      res.json(updated);
    } catch (error) {
      console.error("Error updating journal entry:", error);
      res.status(500).json({ message: "Failed to update journal entry" });
    }
  });

  // Photos routes
  app.get('/api/photos', async (req: any, res) => {
    try {
      const userId = SHARED_USER_ID;
      const pauseId = parsePauseIdQuery(req.query.pauseId);
      const photos = await storage.getUserPhotos(userId, pauseId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  app.post('/api/photos', async (req: any, res) => {
    try {
      const userId = SHARED_USER_ID;
      const validated = insertPhotoSchema.parse({
        ...req.body,
        userId,
      });

      if (typeof validated.caption === "string" && validated.caption.length > 2000) {
        return res.status(400).json({ message: "Caption too long (max 2000 chars)" });
      }

      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(validated.objectPath);

      // Validate the actually-uploaded object: must exist, be an allowed image
      // type, and be within the size limit. This is the real enforcement point
      // since the browser uploads directly to storage via a presigned URL.
      try {
        const meta = await objectStorageService.getObjectMetadata(normalizedPath);
        if (!ALLOWED_IMAGE_TYPES.includes(meta.contentType)) {
          return res.status(400).json({
            message: `Unsupported file type: ${meta.contentType}. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
          });
        }
        if (meta.size > MAX_IMAGE_BYTES) {
          return res.status(400).json({
            message: `File too large (${meta.size} bytes). Max ${MAX_IMAGE_BYTES} bytes.`,
          });
        }
      } catch (err) {
        if (err instanceof ObjectNotFoundError) {
          return res.status(400).json({ message: "Uploaded object not found" });
        }
        throw err;
      }

      const photo = await storage.createPhoto({
        ...validated,
        objectPath: normalizedPath,
      } as any);
      res.json(photo);
    } catch (error) {
      console.error("Error creating photo:", error);
      res.status(500).json({ message: "Failed to create photo" });
    }
  });

  app.delete('/api/photos/:id', async (req: any, res) => {
    try {
      const userId = SHARED_USER_ID;
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid photo id" });
      }

      const photos = await storage.getUserPhotos(userId);
      const photo = photos.find(p => p.id === id);
      
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      try {
        const objectStorageService = new ObjectStorageService();
        await objectStorageService.deleteObject(photo.objectPath);
      } catch (error) {
        console.error("Error deleting object from storage:", error);
      }
      
      await storage.deletePhoto(id, userId);
      res.json({ message: "Photo deleted successfully" });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Object storage routes
  app.post("/api/objects/upload", uploadRateLimiter, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Receive the actual file bytes (browser PUTs here directly — same origin, so
  // no third-party CORS config is required). Streamed to the configured driver.
  app.put(
    "/api/objects/upload/:objectId",
    uploadRateLimiter,
    express.raw({ type: () => true, limit: MAX_IMAGE_BYTES }),
    async (req, res) => {
      try {
        const { objectId } = req.params;
        if (!/^[A-Za-z0-9_-]+$/.test(objectId)) {
          return res.status(400).json({ message: "Invalid object id" });
        }

        const contentType = String(req.headers["content-type"] || "")
          .split(";")[0]
          .trim();
        if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
          return res.status(400).json({
            message: `Unsupported file type: ${contentType || "unknown"}. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
          });
        }

        const body = req.body;
        if (!Buffer.isBuffer(body) || body.length === 0) {
          return res.status(400).json({ message: "Empty upload" });
        }
        if (body.length > MAX_IMAGE_BYTES) {
          return res.status(400).json({ message: "File too large" });
        }

        const objectStorageService = new ObjectStorageService();
        const objectPath = await objectStorageService.putUpload(
          objectId,
          body,
          contentType,
        );
        res.status(200).json({ ok: true, objectPath });
      } catch (error) {
        console.error("Error storing upload:", error);
        res.status(500).json({ message: "Failed to store upload" });
      }
    },
  );

  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      await objectStorageService.downloadObject(req.path, res);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      console.error("Error fetching object:", error);
      return res.sendStatus(500);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
