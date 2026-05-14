import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auditContext, fail, tenantOf } from "@/lib/docs-api";

async function findDocOrFail(
  documentId: string,
  tenantId: string,
): Promise<{ id: string } | null> {
  return prisma.document.findFirst({
    where: { id: documentId, tenantId, status: { not: "SOFT_DELETED" } },
    select: { id: true },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: documentId } = await params;
  const tenantId = tenantOf(req);
  const { ipAddress, userAgent } = auditContext(req);

  const document = await findDocOrFail(documentId, tenantId);
  if (!document) return fail("NOT_FOUND", "document not found", 404);

  let body: {
    linkedEntityType?: unknown;
    linkedEntityId?: unknown;
    linkType?: unknown;
    createdBy?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_JSON", "Request body must be JSON");
  }

  const linkedEntityType = typeof body.linkedEntityType === "string" ? body.linkedEntityType.trim() : "";
  const linkedEntityId = typeof body.linkedEntityId === "string" ? body.linkedEntityId.trim() : "";
  const linkType = typeof body.linkType === "string" && body.linkType.trim()
    ? body.linkType.trim()
    : "ATTACHMENT";
  const createdBy = typeof body.createdBy === "string" && body.createdBy.trim()
    ? body.createdBy.trim()
    : null;

  if (!linkedEntityType) return fail("MISSING_LINKED_ENTITY_TYPE", "linkedEntityType is required");
  if (!linkedEntityId) return fail("MISSING_LINKED_ENTITY_ID", "linkedEntityId is required");

  try {
    const link = await prisma.$transaction(async (tx) => {
      const created = await tx.documentLink.create({
        data: { documentId, linkedEntityType, linkedEntityId, linkType },
      });
      await tx.documentAuditLog.create({
        data: {
          documentId,
          action: "LINK",
          actorId: createdBy,
          ipAddress,
          userAgent,
          details: { linkedEntityType, linkedEntityId, linkType },
        },
      });
      return created;
    });
    return NextResponse.json({ link }, { status: 201 });
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "P2002") {
      return fail("LINK_EXISTS", "Link already exists for this entity", 409);
    }
    return NextResponse.json(
      { error: { code: "DB_WRITE_FAILED", message: err instanceof Error ? err.message : "db write failed" } },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: documentId } = await params;
  const tenantId = tenantOf(req);
  const { ipAddress, userAgent } = auditContext(req);
  const { searchParams } = new URL(req.url);

  const document = await findDocOrFail(documentId, tenantId);
  if (!document) return fail("NOT_FOUND", "document not found", 404);

  const linkedEntityType = (searchParams.get("linkedEntityType") ?? "").trim();
  const linkedEntityId = (searchParams.get("linkedEntityId") ?? "").trim();
  if (!linkedEntityType) return fail("MISSING_LINKED_ENTITY_TYPE", "linkedEntityType query param is required");
  if (!linkedEntityId) return fail("MISSING_LINKED_ENTITY_ID", "linkedEntityId query param is required");

  const link = await prisma.documentLink.findFirst({
    where: { documentId, linkedEntityType, linkedEntityId },
  });
  if (!link) return fail("NOT_FOUND", "link not found", 404);

  await prisma.$transaction(async (tx) => {
    await tx.documentLink.delete({ where: { id: link.id } });
    await tx.documentAuditLog.create({
      data: {
        documentId,
        action: "UNLINK",
        actorId: null,
        ipAddress,
        userAgent,
        details: { linkedEntityType, linkedEntityId, linkType: link.linkType },
      },
    });
  });

  return NextResponse.json({ ok: true });
}
