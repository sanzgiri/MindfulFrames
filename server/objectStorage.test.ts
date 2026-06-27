import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, rm, readdir } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { __setStorageProvider } from "./storageProvider";

let dir: string;
const svc = new ObjectStorageService();

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "mf-store-"));
  // Force the factory to (re)initialize against the local driver + temp dir.
  process.env.STORAGE_DRIVER = "local";
  process.env.LOCAL_STORAGE_DIR = dir;
  __setStorageProvider(null);
});

afterAll(async () => {
  __setStorageProvider(null);
  await rm(dir, { recursive: true, force: true });
});

describe("ObjectStorageService.normalizeObjectEntityPath", () => {
  it("maps the upload URL to the canonical objects path", () => {
    expect(svc.normalizeObjectEntityPath("/api/objects/upload/abc123")).toBe(
      "/objects/uploads/abc123",
    );
  });

  it("is idempotent for an already-canonical path", () => {
    expect(svc.normalizeObjectEntityPath("/objects/uploads/abc123")).toBe(
      "/objects/uploads/abc123",
    );
  });

  it("strips query/hash noise", () => {
    expect(
      svc.normalizeObjectEntityPath("/api/objects/upload/abc123?x=1#y"),
    ).toBe("/objects/uploads/abc123");
  });
});

describe("upload round-trip (local driver)", () => {
  it("stores, reads metadata, and deletes an object", async () => {
    const id = "test-object-1";
    const bytes = Buffer.from("fake-png-bytes");

    const appPath = await svc.putUpload(id, bytes, "image/png");
    expect(appPath).toBe("/objects/uploads/test-object-1");

    const meta = await svc.getObjectMetadata(appPath);
    expect(meta.contentType).toBe("image/png");
    expect(meta.size).toBe(bytes.length);

    await svc.deleteObject(appPath);
    await expect(svc.getObjectMetadata(appPath)).rejects.toBeInstanceOf(
      ObjectNotFoundError,
    );
  });

  it("rejects metadata lookups for a non-canonical path", async () => {
    await expect(svc.getObjectMetadata("/etc/passwd")).rejects.toBeInstanceOf(
      ObjectNotFoundError,
    );
  });

  it("rejects an upload id with path-traversal characters", async () => {
    await expect(
      svc.putUpload("../escape", Buffer.from("x"), "image/png"),
    ).rejects.toBeInstanceOf(ObjectNotFoundError);
    // Nothing should have escaped the storage dir.
    const entries = await readdir(dir);
    expect(entries.some((e) => e.includes(".."))).toBe(false);
  });
});
