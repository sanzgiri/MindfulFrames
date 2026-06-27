import express, { type Express } from "express";
import request from "supertest";
import { describe, it, expect, beforeEach, vi } from "vitest";

// ---- Mock the storage layer so routes don't touch a real database. ----
// Defined via vi.hoisted so the reference is available inside the hoisted
// vi.mock factory below.
const mockStorage = vi.hoisted(() => ({
  getUser: vi.fn(),
  upsertUser: vi.fn(),
  updateUserSettings: vi.fn(),
  getAllPauses: vi.fn(),
  getPause: vi.fn(),
  getActivitiesByPause: vi.fn(),
  getAllActivities: vi.fn(),
  getUserProgress: vi.fn(),
  updateProgress: vi.fn(),
  getUserJournalEntries: vi.fn(),
  createJournalEntry: vi.fn(),
  updateJournalEntry: vi.fn(),
  getUserPhotos: vi.fn(),
  createPhoto: vi.fn(),
  deletePhoto: vi.fn(),
  getLocationsByPause: vi.fn(),
  getPhotographersByPause: vi.fn(),
}));

vi.mock("./storage", () => ({ storage: mockStorage }));

// Mock object storage (not exercised by the routes under test here).
vi.mock("./objectStorage", () => {
  class ObjectNotFoundError extends Error {}
  return {
    ObjectNotFoundError,
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png"],
    MAX_IMAGE_BYTES: 15 * 1024 * 1024,
    ObjectStorageService: class {
      normalizeObjectEntityPath(p: string) {
        return p;
      }
      async getObjectMetadata() {
        return { contentType: "image/jpeg", size: 100 };
      }
      async getObjectEntityUploadURL() {
        return "/api/objects/upload/test-id";
      }
      async putUpload() {
        return "/objects/uploads/test-id";
      }
      async deleteObject() {}
      async downloadObject() {}
    },
  };
});

import { registerRoutes } from "./routes";

async function makeApp(): Promise<Express> {
  const app = express();
  app.use(express.json());
  await registerRoutes(app);
  return app;
}

describe("routes", () => {
  let app: Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockStorage.getUser.mockResolvedValue({
      id: "main-user",
      locationPreference: "portland",
    });
    app = await makeApp();
  });

  describe("integer param validation", () => {
    it("returns 400 for a non-numeric pause id", async () => {
      const res = await request(app).get("/api/pauses/abc");
      expect(res.status).toBe(400);
      expect(mockStorage.getPause).not.toHaveBeenCalled();
    });

    it("returns 400 for a zero / negative pause id", async () => {
      const res = await request(app).get("/api/pauses/0");
      expect(res.status).toBe(400);
    });

    it("returns 404 when a valid id has no pause", async () => {
      mockStorage.getPause.mockResolvedValue(undefined);
      const res = await request(app).get("/api/pauses/999");
      expect(res.status).toBe(404);
    });

    it("returns 400 for an invalid journal id on PUT", async () => {
      const res = await request(app)
        .put("/api/journal/notanid")
        .send({ content: "hi" });
      expect(res.status).toBe(400);
      expect(mockStorage.updateJournalEntry).not.toHaveBeenCalled();
    });

    it("returns 400 for an invalid photo id on DELETE", async () => {
      const res = await request(app).delete("/api/photos/xyz");
      expect(res.status).toBe(400);
    });
  });

  describe("location filtering", () => {
    it("passes an explicit ?locationType to storage", async () => {
      mockStorage.getLocationsByPause.mockResolvedValue([]);
      await request(app).get("/api/pauses/1/locations?locationType=murrayhill");
      expect(mockStorage.getLocationsByPause).toHaveBeenCalledWith(1, "murrayhill");
    });

    it("falls back to the user's saved preference when none is given", async () => {
      mockStorage.getUser.mockResolvedValue({
        id: "main-user",
        locationPreference: "murrayhill",
      });
      mockStorage.getLocationsByPause.mockResolvedValue([]);
      await request(app).get("/api/pauses/1/locations");
      expect(mockStorage.getLocationsByPause).toHaveBeenCalledWith(1, "murrayhill");
    });

    it("ignores an invalid locationType and uses the default", async () => {
      mockStorage.getUser.mockResolvedValue({
        id: "main-user",
        locationPreference: undefined,
      });
      mockStorage.getLocationsByPause.mockResolvedValue([]);
      await request(app).get("/api/pauses/1/locations?locationType=mars");
      expect(mockStorage.getLocationsByPause).toHaveBeenCalledWith(1, "portland");
    });
  });

  describe("activities", () => {
    it("uses the single-query getAllActivities (no N+1)", async () => {
      mockStorage.getAllActivities.mockResolvedValue([{ id: 1 }]);
      const res = await request(app).get("/api/activities");
      expect(res.status).toBe(200);
      expect(mockStorage.getAllActivities).toHaveBeenCalledTimes(1);
      // The old N+1 implementation called these; the new one must not.
      expect(mockStorage.getAllPauses).not.toHaveBeenCalled();
      expect(mockStorage.getActivitiesByPause).not.toHaveBeenCalled();
    });
  });

  describe("settings validation", () => {
    it("rejects an invalid locationPreference enum value", async () => {
      const res = await request(app)
        .put("/api/user/settings")
        .send({ locationPreference: "atlantis" });
      expect(res.status).toBe(500); // zod parse throws -> caught -> 500
      expect(mockStorage.updateUserSettings).not.toHaveBeenCalled();
    });

    it("accepts a valid locationPreference", async () => {
      mockStorage.updateUserSettings.mockResolvedValue({ id: "main-user" });
      const res = await request(app)
        .put("/api/user/settings")
        .send({ locationPreference: "murrayhill" });
      expect(res.status).toBe(200);
      expect(mockStorage.updateUserSettings).toHaveBeenCalledWith(
        "main-user",
        expect.objectContaining({ locationPreference: "murrayhill" }),
      );
    });
  });

  describe("journal", () => {
    it("requires content on update", async () => {
      const res = await request(app).put("/api/journal/1").send({});
      expect(res.status).toBe(400);
    });
  });
});
