import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import session from "express-session";
import {
  insertJournalEntrySchema,
  insertPhotoSchema,
  updateUserProgressSchema,
  updateUserSettingsSchema,
} from "@shared/schema";

// Mock user ID for testing without authentication
// Use session to create unique user per browser session
function getMockUserId(req: any): string {
  if (!req.session.mockUserId) {
    req.session.mockUserId = `demo-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  return req.session.mockUserId;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware for demo users
  app.use(session({
    secret: process.env.SESSION_SECRET || 'demo-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    }
  }));

  // Auth routes - mocked for now
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const userId = getMockUserId(req);
      const user = await storage.getUser(userId);
      if (!user) {
        // Create a demo user if it doesn't exist with unique email
        await storage.upsertUser({
          id: userId,
          email: `${userId}@demo.local`,
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: null,
        });
        const newUser = await storage.getUser(userId);
        res.json(newUser);
      } else {
        res.json(user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User settings
  app.put('/api/user/settings', async (req: any, res) => {
    try {
      const userId = getMockUserId(req);
      console.log('Updating settings for user:', userId);
      console.log('Request body:', req.body);
      
      const validated = updateUserSettingsSchema.parse(req.body);
      console.log('Validated data:', validated);
      
      const settings: any = {};
      if (validated.startDate) {
        settings.startDate = new Date(validated.startDate);
      }
      if (validated.locationPreference) {
        settings.locationPreference = validated.locationPreference;
      }
      
      console.log('Settings to update:', settings);
      const user = await storage.updateUserSettings(userId, settings);
      console.log('Updated user:', user);
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
      const id = parseInt(req.params.id);
      const pause = await storage.getPause(id);
      if (!pause) {
        return res.status(404).json({ message: "Pause not found" });
      }

      const activities = await storage.getActivitiesByPause(id);
      const locations = await storage.getLocationsByPause(id);
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
      const pauses = await storage.getAllPauses();
      const allActivities = [];
      for (const pause of pauses) {
        const activities = await storage.getActivitiesByPause(pause.id);
        allActivities.push(...activities);
      }
      res.json(allActivities);
    } catch (error) {
      console.error("Error fetching all activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get('/api/pauses/:pauseId/activities', async (req, res) => {
    try {
      const pauseId = parseInt(req.params.pauseId);
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
      const pauseId = parseInt(req.params.pauseId);
      const locations = await storage.getLocationsByPause(pauseId);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Photographers routes
  app.get('/api/pauses/:pauseId/photographers', async (req, res) => {
    try {
      const pauseId = parseInt(req.params.pauseId);
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
      const userId = getMockUserId(req);
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.put('/api/user/progress', async (req: any, res) => {
    try {
      const userId = getMockUserId(req);
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
      const userId = getMockUserId(req);
      const pauseId = req.query.pauseId ? parseInt(req.query.pauseId as string) : undefined;
      const entries = await storage.getUserJournalEntries(userId, pauseId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post('/api/journal', async (req: any, res) => {
    try {
      const userId = getMockUserId(req);
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
      const id = parseInt(req.params.id);
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
      const userId = getMockUserId(req);
      const pauseId = req.query.pauseId ? parseInt(req.query.pauseId as string) : undefined;
      const photos = await storage.getUserPhotos(userId, pauseId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  app.post('/api/photos', async (req: any, res) => {
    try {
      const userId = getMockUserId(req);
      const validated = insertPhotoSchema.parse({
        ...req.body,
        userId,
      });
      
      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(validated.objectPath);
      
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
      const userId = getMockUserId(req);
      const id = parseInt(req.params.id);
      
      const photos = await storage.getUserPhotos(userId);
      const photo = photos.find(p => p.id === id);
      
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      try {
        const objectStorageService = new ObjectStorageService();
        const objectFile = await objectStorageService.getObjectEntityFile(photo.objectPath);
        await objectFile.delete();
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
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error fetching object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
