import type { Readable } from "node:stream";

export interface PutOptions {
  tenantId: string;
  documentId: string;
  versionId: string;
  fileName: string;
  contentType?: string;
}

export interface PutResult {
  storageKey: string;
  fileSize: number;
  checksum: string;
}

export interface GetResult {
  stream: Readable;
  fileSize: number;
  contentType?: string;
}

export interface StorageAdapter {
  put(input: Readable | Buffer, opts: PutOptions): Promise<PutResult>;
  get(storageKey: string): Promise<GetResult>;
  delete(storageKey: string): Promise<void>;
  exists(storageKey: string): Promise<boolean>;
}
