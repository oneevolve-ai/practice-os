import { LocalFsAdapter } from "./local-fs";
import type { StorageAdapter } from "./types";

let cached: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (cached) return cached;

  const adapter = process.env.STORAGE_ADAPTER ?? "local";
  const baseDir = process.env.STORAGE_BASE_DIR;

  if (!baseDir) {
    throw new Error("STORAGE_BASE_DIR env var is required");
  }

  if (adapter === "local") {
    cached = new LocalFsAdapter(baseDir);
    return cached;
  }

  throw new Error(`Unknown STORAGE_ADAPTER: ${adapter}`);
}

export type { GetResult, PutOptions, PutResult, StorageAdapter } from "./types";
