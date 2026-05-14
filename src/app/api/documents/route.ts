import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_TITLE = 200;
const MAX_CATEGORY = 100;
const MAX_DESCRIPTION = 2000;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function tenantOf(req: NextRequest): string {
  return req.headers.get("x-tenant-id") ?? "default";
}

function auditContext(req: NextRequest): { ipAddress: string | null; userAgent: string | null } {
  const xff = req.headers.get("x-forwarded-for");
  const ipAddress = xff ? xff.split(",")[0]!.trim() : req.headers.get("x-real-ip");
  return { ipAddress, userAgent: req.headers.get("user-agent") };
}

function fail(code: string, message: string, status = 400) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function GET(req: NextRequest) {
  const tenantId = tenantOf(req);
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category") ?? undefined;
  const status = searchParams.get("status") ?? "ACTIVE";

  const rawLimit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
  const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : DEFAULT_LIMIT, 1), MAX_LIMIT);
  const rawOffset = Number(searchParams.get("offset") ?? 0);
  const offset = Math.max(Number.isFinite(rawOffset) ? rawOffset : 0, 0);

  const where = { tenantId, status, ...(category ? { category } : {}) };

  const [total, docs] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.findMany({
      where,
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        currentVersionId: true,
        _count: { select: { links: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
  ]);

  const currentIds = docs.map((d) => d.currentVersionId).filter((x): x is string => !!x);
  const versions = currentIds.length
    ? await prisma.documentVersion.findMany({
        where: { id: { in: currentIds } },
        select: {
          id: true,
          versionNumber: true,
          fileName: true,
          fileSize: true,
          fileType: true,
          uploadedAt: true,
        },
      })
    : [];
  const versionMap = new Map(versions.map((v) => [v.id, v]));

  const documents = docs.map(({ currentVersionId, _count, ...rest }) => ({
    ...rest,
    linkCount: _count.links,
    currentVersion: currentVersionId ? versionMap.get(currentVersionId) ?? null : null,
  }));

  return NextResponse.json({ documents, total, limit, offset });
}

export async function POST(req: NextRequest) {
  const tenantId = tenantOf(req);
  const { ipAddress, userAgent } = auditContext(req);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("INVALID_MULTIPART", "Request body must be multipart/form-data");
  }

  const title = String(form.get("title") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();
  const descriptionRaw = form.get("description");
  const description = descriptionRaw == null ? null : String(descriptionRaw).trim();
  const createdByRaw = form.get("createdBy");
  const createdBy = createdByRaw == null ? null : String(createdByRaw).trim() || null;
  const file = form.get("file");

  if (!title) return fail("MISSING_TITLE", "title is required");
  if (title.length > MAX_TITLE) return fail("TITLE_TOO_LONG", `title exceeds ${MAX_TITLE} chars`);
  if (!category) return fail("MISSING_CATEGORY", "category is required");
  if (category.length > MAX_CATEGORY) return fail("CATEGORY_TOO_LONG", `category exceeds ${MAX_CATEGORY} chars`);
  if (description && description.length > MAX_DESCRIPTION) return fail("DESCRIPTION_TOO_LONG", `description exceeds ${MAX_DESCRIPTION} chars`);
  if (!(file instanceof File)) return fail("MISSING_FILE", "file is required");
  if (file.size === 0) return fail("MISSING_FILE", "file is empty");
  if (file.size > MAX_FILE_SIZE) return fail("FILE_TOO_LARGE", `file exceeds ${MAX_FILE_SIZE} bytes`);

  const docId = randomUUID();
  const versionId = randomUUID();
  const storage = getStorage();
  const sourceStream = Readable.fromWeb(file.stream() as Parameters<typeof Readable.fromWeb>[0]);

  let putResult;
  try {
    putResult = await storage.put(sourceStream, {
      tenantId,
      documentId: docId,
      versionId,
      fileName: file.name,
      contentType: file.type || undefined,
    });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "STORAGE_WRITE_FAILED", message: err instanceof Error ? err.message : "storage write failed" } },
      { status: 500 },
    );
  }

  const { storageKey, fileSize, checksum } = putResult;
  const fileType = file.type || null;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          id: docId,
          tenantId,
          title,
          category,
          description,
          status: "ACTIVE",
          currentVersionId: versionId,
          createdBy,
        },
      });
      const version = await tx.documentVersion.create({
        data: {
          id: versionId,
          documentId: docId,
          versionNumber: 1,
          storageKey,
          fileName: file.name,
          fileSize,
          fileType,
          checksum,
          uploadedBy: createdBy,
        },
      });
      await tx.documentAuditLog.create({
        data: {
          documentId: docId,
          action: "CREATE",
          actorId: createdBy,
          ipAddress,
          userAgent,
          details: { title, category, fileName: file.name },
        },
      });
      await tx.documentAuditLog.create({
        data: {
          documentId: docId,
          action: "UPLOAD_VERSION",
          actorId: createdBy,
          ipAddress,
          userAgent,
          details: { versionNumber: 1, fileName: file.name, checksum, fileSize },
        },
      });
      return { doc, version };
    });

    return NextResponse.json({ document: result.doc, version: result.version }, { status: 201 });
  } catch (err) {
    await storage.delete(storageKey).catch(() => {});
    return NextResponse.json(
      { error: { code: "DB_WRITE_FAILED", message: err instanceof Error ? err.message : "db write failed" } },
      { status: 500 },
    );
  }
}
