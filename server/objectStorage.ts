import { Response } from "express";
import {
  ObjectNotFoundError,
  getStorageProvider,
  newObjectId,
} from "./storageProvider";

export { ObjectNotFoundError };

// Upload constraints for user photos.
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
];
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB

const OBJECT_ID_RE = /^[A-Za-z0-9_-]+$/;
const KEY_PREFIX = "uploads/";

/** Validate an object id and turn it into a storage key. */
function objectIdToKey(objectId: string): string {
  if (!OBJECT_ID_RE.test(objectId)) throw new ObjectNotFoundError();
  return `${KEY_PREFIX}${objectId}`;
}

/** Map a canonical app path ("/objects/uploads/<id>") to a storage key. */
function appPathToKey(appPath: string): string {
  const clean = appPath.split("?")[0].split("#")[0];
  const m = clean.match(/^\/objects\/uploads\/([A-Za-z0-9_-]+)$/);
  if (!m) throw new ObjectNotFoundError();
  return `${KEY_PREFIX}${m[1]}`;
}

/**
 * Host-agnostic object storage service.
 *
 * Upload flow (no third-party CORS needed — the browser PUTs to our own
 * origin, and we stream the bytes to whichever storage driver is configured):
 *   1. POST /api/objects/upload            -> { uploadURL: "/api/objects/upload/<id>" }
 *   2. PUT  /api/objects/upload/<id>       -> stores bytes (handled in routes.ts)
 *   3. POST /api/photos { objectPath }     -> normalized to "/objects/uploads/<id>"
 *   4. GET  /objects/uploads/<id>          -> streams the bytes back
 */
export class ObjectStorageService {
  /** Returns a same-origin URL the client should PUT the file to. */
  async getObjectEntityUploadURL(): Promise<string> {
    return `/api/objects/upload/${newObjectId()}`;
  }

  /** Persist an uploaded file; returns the canonical app path. */
  async putUpload(
    objectId: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    const key = objectIdToKey(objectId);
    await getStorageProvider().putObject(key, body, contentType);
    return `/objects/uploads/${objectId}`;
  }

  /**
   * Normalize whatever the client sent as `objectPath` into the canonical
   * "/objects/uploads/<id>" form. Accepts the upload URL or an already-
   * normalized path; anything else is returned unchanged (and will fail
   * validation downstream).
   */
  normalizeObjectEntityPath(rawPath: string): string {
    const clean = rawPath.split("?")[0].split("#")[0];
    let m = clean.match(/^\/api\/objects\/upload\/([A-Za-z0-9_-]+)$/);
    if (m) return `/objects/uploads/${m[1]}`;
    m = clean.match(/^\/objects\/uploads\/([A-Za-z0-9_-]+)$/);
    if (m) return clean;
    return rawPath;
  }

  /** Metadata for a stored object; throws ObjectNotFoundError if missing. */
  async getObjectMetadata(
    appPath: string,
  ): Promise<{ contentType: string; size: number }> {
    const key = appPathToKey(appPath);
    return getStorageProvider().headObject(key);
  }

  /** Stream a stored object to the HTTP response. */
  async downloadObject(
    appPath: string,
    res: Response,
    cacheTtlSec: number = 3600,
  ): Promise<void> {
    const key = appPathToKey(appPath); // throws ObjectNotFoundError
    const { stream, contentType, size } =
      await getStorageProvider().getObject(key);

    res.set({
      "Content-Type": contentType,
      "Content-Length": String(size),
      "Cache-Control": `private, max-age=${cacheTtlSec}`,
    });

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error streaming file" });
      }
    });
    stream.pipe(res);
  }

  /** Delete a stored object (best-effort). */
  async deleteObject(appPath: string): Promise<void> {
    const key = appPathToKey(appPath);
    await getStorageProvider().deleteObject(key);
  }
}
