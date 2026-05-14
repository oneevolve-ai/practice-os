import { NextRequest } from "next/server";
import { Readable } from "node:stream";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";
import { auditContext, fail, tenantOf } from "@/lib/docs-api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: documentId } = await params;
  const tenantId = tenantOf(req);
  const { ipAddress, userAgent } = auditContext(req);
  const { searchParams } = new URL(req.url);
  const versionParam = searchParams.get("version");
  const downloadedByRaw = searchParams.get("downloadedBy");
  const downloadedBy = downloadedByRaw == null ? null : downloadedByRaw.trim() || null;

  const document = await prisma.document.findFirst({
    where: { id: documentId, tenantId, status: { not: "SOFT_DELETED" } },
    select: { id: true, currentVersionId: true },
  });
  if (!document) {
    return fail("NOT_FOUND", "document not found", 404);
  }

  let version;
  if (versionParam != null) {
    const parsed = Number.parseInt(versionParam, 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return fail("INVALID_VERSION", "version must be a positive integer");
    }
    version = await prisma.documentVersion.findFirst({
      where: { documentId, versionNumber: parsed },
    });
  } else {
    if (!document.currentVersionId) {
      return fail("NO_CURRENT_VERSION", "document has no current version", 404);
    }
    version = await prisma.documentVersion.findUnique({
      where: { id: document.currentVersionId },
    });
  }

  if (!version) {
    return fail("VERSION_NOT_FOUND", "version not found", 404);
  }

  await prisma.documentAuditLog.create({
    data: {
      documentId,
      action: "DOWNLOAD",
      actorId: downloadedBy,
      ipAddress,
      userAgent,
      details: {
        versionNumber: version.versionNumber,
        fileName: version.fileName,
        checksum: version.checksum,
      },
    },
  });

  const storage = getStorage();
  const { stream, fileSize, contentType } = await storage.get(version.storageKey);
  const webStream = Readable.toWeb(stream) as unknown as ReadableStream<Uint8Array>;

  return new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": version.fileType ?? contentType ?? "application/octet-stream",
      "Content-Length": String(fileSize),
      "Content-Disposition": `attachment; filename="${encodeURIComponent(version.fileName)}"`,
      "X-Document-Version": String(version.versionNumber),
      "X-Document-Checksum": version.checksum,
    },
  });
}
