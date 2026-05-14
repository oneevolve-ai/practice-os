import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";
import { auditContext, fail, tenantOf } from "@/lib/docs-api";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: documentId } = await params;
  const tenantId = tenantOf(req);
  const { ipAddress, userAgent } = auditContext(req);

  const document = await prisma.document.findFirst({
    where: { id: documentId, tenantId, status: { not: "SOFT_DELETED" } },
    select: { id: true },
  });
  if (!document) {
    return fail("NOT_FOUND", "document not found", 404);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("INVALID_MULTIPART", "Request body must be multipart/form-data");
  }

  const file = form.get("file");
  const uploadedByRaw = form.get("uploadedBy");
  const uploadedBy = uploadedByRaw == null ? null : String(uploadedByRaw).trim() || null;

  if (!(file instanceof File)) return fail("MISSING_FILE", "file is required");
  if (file.size === 0) return fail("MISSING_FILE", "file is empty");
  if (file.size > MAX_FILE_SIZE) return fail("FILE_TOO_LARGE", `file exceeds ${MAX_FILE_SIZE} bytes`);

  const maxAgg = await prisma.documentVersion.aggregate({
    where: { documentId },
    _max: { versionNumber: true },
  });
  const versionNumber = (maxAgg._max.versionNumber ?? 0) + 1;
  const versionId = randomUUID();

  const storage = getStorage();
  const sourceStream = Readable.fromWeb(file.stream() as Parameters<typeof Readable.fromWeb>[0]);

  let putResult;
  try {
    putResult = await storage.put(sourceStream, {
      tenantId,
      documentId,
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
      const version = await tx.documentVersion.create({
        data: {
          id: versionId,
          documentId,
          versionNumber,
          storageKey,
          fileName: file.name,
          fileSize,
          fileType,
          checksum,
          uploadedBy,
        },
      });
      const updatedDoc = await tx.document.update({
        where: { id: documentId },
        data: { currentVersionId: versionId, updatedAt: new Date() },
        select: { id: true, currentVersionId: true },
      });
      await tx.documentAuditLog.create({
        data: {
          documentId,
          action: "UPLOAD_VERSION",
          actorId: uploadedBy,
          ipAddress,
          userAgent,
          details: { versionNumber, fileName: file.name, checksum, fileSize },
        },
      });
      return { version, document: updatedDoc };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    await storage.delete(storageKey).catch(() => {});
    return NextResponse.json(
      { error: { code: "DB_WRITE_FAILED", message: err instanceof Error ? err.message : "db write failed" } },
      { status: 500 },
    );
  }
}
