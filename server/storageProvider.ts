import { randomUUID } from "crypto";
import { createReadStream } from "fs";
import { mkdir, writeFile, readFile, stat, unlink } from "fs/promises";
import path from "path";
import { Readable } from "stream";

/**
 * Storage abstraction so the app is not tied to any one host/provider.
 *
 * Two drivers are available, selected at runtime by environment:
 *   - "local": files on the local filesystem (zero-config; great for dev).
 *   - "s3":    any S3-compatible object store (Cloudflare R2, AWS S3,
 *              Backblaze B2, MinIO, ...). Recommended for production on
 *              hosts with ephemeral disks (e.g. Render free tier).
 *
 * Selection: STORAGE_DRIVER=local|s3. If unset, defaults to "s3" when an
 * S3_BUCKET is configured, otherwise "local".
 */

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export interface StoredObjectMetadata {
  contentType: string;
  size: number;
}

export interface StorageProvider {
  /** Store bytes under `key`. */
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;
  /** Return metadata; throws ObjectNotFoundError if the key does not exist. */
  headObject(key: string): Promise<StoredObjectMetadata>;
  /** Open a readable stream; throws ObjectNotFoundError if missing. */
  getObject(
    key: string,
  ): Promise<{ stream: Readable; contentType: string; size: number }>;
  /** Delete the object. Missing keys are a no-op. */
  deleteObject(key: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Local filesystem driver
// ---------------------------------------------------------------------------

class LocalDiskStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir =
      baseDir ||
      process.env.LOCAL_STORAGE_DIR ||
      path.resolve(process.cwd(), ".data", "uploads");
  }

  private filePath(key: string): string {
    // `key` is always server-derived (e.g. "uploads/<uuid>"), but guard against
    // path traversal regardless.
    const safe = path
      .normalize(key)
      .replace(/^(\.\.(\/|\\|$))+/, "")
      .replace(/^[/\\]+/, "");
    return path.join(this.baseDir, safe);
  }

  private metaPath(key: string): string {
    return `${this.filePath(key)}.meta.json`;
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    const fp = this.filePath(key);
    await mkdir(path.dirname(fp), { recursive: true });
    await writeFile(fp, body);
    await writeFile(
      this.metaPath(key),
      JSON.stringify({ contentType, size: body.length }),
    );
  }

  async headObject(key: string): Promise<StoredObjectMetadata> {
    const fp = this.filePath(key);
    let size: number;
    try {
      const s = await stat(fp);
      size = s.size;
    } catch {
      throw new ObjectNotFoundError();
    }
    let contentType = "application/octet-stream";
    try {
      const meta = JSON.parse(await readFile(this.metaPath(key), "utf8"));
      if (meta?.contentType) contentType = meta.contentType;
      if (typeof meta?.size === "number") size = meta.size;
    } catch {
      // No sidecar metadata; fall back to stat size + octet-stream.
    }
    return { contentType, size };
  }

  async getObject(
    key: string,
  ): Promise<{ stream: Readable; contentType: string; size: number }> {
    const meta = await this.headObject(key); // throws if missing
    const stream = createReadStream(this.filePath(key));
    return { stream, contentType: meta.contentType, size: meta.size };
  }

  async deleteObject(key: string): Promise<void> {
    await unlink(this.filePath(key)).catch(() => {});
    await unlink(this.metaPath(key)).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// S3-compatible driver (lazy-loads @aws-sdk/client-s3 so local dev needs no SDK)
// ---------------------------------------------------------------------------

class S3StorageProvider implements StorageProvider {
  private bucket: string;
  private clientPromise: Promise<any> | null = null;

  constructor() {
    const bucket = process.env.S3_BUCKET;
    if (!bucket) {
      throw new Error(
        "S3_BUCKET is required when STORAGE_DRIVER=s3. Set S3_BUCKET, " +
          "S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY and (for R2/MinIO) S3_ENDPOINT.",
      );
    }
    this.bucket = bucket;
  }

  private async getClient(): Promise<any> {
    if (!this.clientPromise) {
      this.clientPromise = (async () => {
        const { S3Client } = await import("@aws-sdk/client-s3");
        const endpoint = process.env.S3_ENDPOINT || undefined;
        const forcePathStyle =
          (process.env.S3_FORCE_PATH_STYLE ?? "true").toLowerCase() !== "false";
        return new S3Client({
          region: process.env.S3_REGION || "auto",
          endpoint,
          forcePathStyle,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
          },
        });
      })();
    }
    return this.clientPromise;
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.getClient();
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        ContentLength: body.length,
      }),
    );
  }

  async headObject(key: string): Promise<StoredObjectMetadata> {
    const { HeadObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.getClient();
    try {
      const out = await client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return {
        contentType: out.ContentType || "application/octet-stream",
        size: Number(out.ContentLength ?? 0),
      };
    } catch (err: any) {
      if (
        err?.name === "NotFound" ||
        err?.$metadata?.httpStatusCode === 404
      ) {
        throw new ObjectNotFoundError();
      }
      throw err;
    }
  }

  async getObject(
    key: string,
  ): Promise<{ stream: Readable; contentType: string; size: number }> {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.getClient();
    try {
      const out = await client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return {
        stream: out.Body as Readable,
        contentType: out.ContentType || "application/octet-stream",
        size: Number(out.ContentLength ?? 0),
      };
    } catch (err: any) {
      if (
        err?.name === "NoSuchKey" ||
        err?.$metadata?.httpStatusCode === 404
      ) {
        throw new ObjectNotFoundError();
      }
      throw err;
    }
  }

  async deleteObject(key: string): Promise<void> {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.getClient();
    await client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}

// ---------------------------------------------------------------------------
// Factory (cached singleton)
// ---------------------------------------------------------------------------

let provider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (provider) return provider;
  const driver = (
    process.env.STORAGE_DRIVER || (process.env.S3_BUCKET ? "s3" : "local")
  ).toLowerCase();
  provider = driver === "s3" ? new S3StorageProvider() : new LocalDiskStorageProvider();
  // eslint-disable-next-line no-console
  console.log(`[storage] using "${driver}" driver`);
  return provider;
}

/** Test seam: override the provider (e.g. with an in-memory fake). */
export function __setStorageProvider(p: StorageProvider | null): void {
  provider = p;
}

/** Generate a fresh, filesystem-safe object id. */
export function newObjectId(): string {
  return randomUUID();
}
