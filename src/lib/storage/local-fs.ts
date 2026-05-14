import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { access, mkdir, stat, unlink } from "node:fs/promises";
import { dirname, extname, join, resolve, sep } from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type {
  GetResult,
  PutOptions,
  PutResult,
  StorageAdapter,
} from "./types";

const EXT_TO_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".json": "application/json",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".zip": "application/zip",
};

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function inferContentType(storageKey: string): string | undefined {
  const ext = extname(storageKey).toLowerCase();
  return EXT_TO_MIME[ext];
}

export class LocalFsAdapter implements StorageAdapter {
  private readonly resolvedBase: string;

  constructor(private readonly baseDir: string) {
    this.resolvedBase = resolve(baseDir);
  }

  private resolveSafe(storageKey: string): string {
    if (storageKey.startsWith("/") || storageKey.startsWith(sep)) {
      throw new Error("storageKey must be relative");
    }
    const full = resolve(join(this.resolvedBase, storageKey));
    if (full !== this.resolvedBase && !full.startsWith(this.resolvedBase + sep)) {
      throw new Error("storageKey escapes baseDir");
    }
    return full;
  }

  async put(input: Readable | Buffer, opts: PutOptions): Promise<PutResult> {
    const safeName = sanitizeFileName(opts.fileName);
    const storageKey = `${opts.tenantId}/${opts.documentId}/${opts.versionId}-${safeName}`;
    const fullPath = this.resolveSafe(storageKey);

    await mkdir(dirname(fullPath), { recursive: true });

    const source: Readable = Buffer.isBuffer(input) ? Readable.from(input) : input;
    const hash = createHash("sha256");
    let fileSize = 0;

    const counter = new Transform({
      transform(chunk: Buffer, _enc, cb) {
        hash.update(chunk);
        fileSize += chunk.length;
        cb(null, chunk);
      },
    });

    await pipeline(source, counter, createWriteStream(fullPath));

    return {
      storageKey,
      fileSize,
      checksum: hash.digest("hex"),
    };
  }

  async get(storageKey: string): Promise<GetResult> {
    const fullPath = this.resolveSafe(storageKey);
    const st = await stat(fullPath);
    const stream = createReadStream(fullPath);
    return {
      stream,
      fileSize: st.size,
      contentType: inferContentType(storageKey),
    };
  }

  async delete(storageKey: string): Promise<void> {
    const fullPath = this.resolveSafe(storageKey);
    try {
      await unlink(fullPath);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "ENOENT"
      ) {
        return;
      }
      throw err;
    }
  }

  async exists(storageKey: string): Promise<boolean> {
    const fullPath = this.resolveSafe(storageKey);
    try {
      await access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
