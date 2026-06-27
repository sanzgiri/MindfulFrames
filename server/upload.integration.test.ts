import express, { type Express } from "express";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

// Storage routes don't touch the DB layer, so a bare stub is enough and keeps
// this an integration test of the REAL object-storage path (not mocked).
vi.mock("./storage", () => ({ storage: {} }));

import { registerRoutes } from "./routes";
import { __setStorageProvider } from "./storageProvider";

let app: Express;
let dir: string;

// A tiny valid-enough PNG byte payload (content isn't validated, only type/size).
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "mf-upload-"));
  process.env.STORAGE_DRIVER = "local";
  process.env.LOCAL_STORAGE_DIR = dir;
  __setStorageProvider(null);

  app = express();
  app.use(express.json());
  await registerRoutes(app);
});

afterAll(async () => {
  __setStorageProvider(null);
  await rm(dir, { recursive: true, force: true });
});

describe("object upload/serve HTTP flow", () => {
  it("issues an upload URL, stores bytes, and serves them back", async () => {
    // 1. Ask for an upload URL.
    const init = await request(app).post("/api/objects/upload");
    expect(init.status).toBe(200);
    const uploadURL: string = init.body.uploadURL;
    expect(uploadURL).toMatch(/^\/api\/objects\/upload\/[A-Za-z0-9_-]+$/);

    // 2. PUT the bytes to our own server.
    const put = await request(app)
      .put(uploadURL)
      .set("Content-Type", "image/png")
      .send(PNG);
    expect(put.status).toBe(200);
    const objectPath: string = put.body.objectPath;
    expect(objectPath).toMatch(/^\/objects\/uploads\/[A-Za-z0-9_-]+$/);

    // 3. GET the bytes back via the public object route.
    const get = await request(app).get(objectPath);
    expect(get.status).toBe(200);
    expect(get.headers["content-type"]).toContain("image/png");
    expect(Buffer.compare(get.body, PNG)).toBe(0);
  });

  it("rejects a disallowed content type", async () => {
    const init = await request(app).post("/api/objects/upload");
    const res = await request(app)
      .put(init.body.uploadURL)
      .set("Content-Type", "application/pdf")
      .send(Buffer.from("nope"));
    expect(res.status).toBe(400);
  });

  it("rejects an empty upload", async () => {
    const init = await request(app).post("/api/objects/upload");
    const res = await request(app)
      .put(init.body.uploadURL)
      .set("Content-Type", "image/png")
      .send(Buffer.alloc(0));
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown object", async () => {
    const res = await request(app).get("/objects/uploads/does-not-exist");
    expect(res.status).toBe(404);
  });
});
