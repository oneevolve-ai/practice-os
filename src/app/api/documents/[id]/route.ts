import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auditContext, tenantOf } from "@/lib/docs-api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tenantId = tenantOf(req);

  const document = await prisma.document.findFirst({
    where: { id, tenantId },
    select: {
      id: true,
      tenantId: true,
      title: true,
      category: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      createdBy: true,
      currentVersionId: true,
      versions: {
        select: {
          id: true,
          versionNumber: true,
          fileName: true,
          fileSize: true,
          fileType: true,
          checksum: true,
          uploadedAt: true,
          uploadedBy: true,
        },
        orderBy: { versionNumber: "desc" },
      },
      links: {
        select: {
          id: true,
          linkedEntityType: true,
          linkedEntityId: true,
          linkType: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!document) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "document not found" } }, { status: 404 });
  }

  const { versions, links, ...rest } = document;
  return NextResponse.json({ document: rest, versions, links });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tenantId = tenantOf(req);
  const { ipAddress, userAgent } = auditContext(req);

  const existing = await prisma.document.findFirst({
    where: { id, tenantId },
    select: { id: true, status: true },
  });

  if (!existing) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "document not found" } }, { status: 404 });
  }

  const deletedAt = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.document.update({
      where: { id },
      data: { status: "SOFT_DELETED", deletedAt },
      select: { id: true, deletedAt: true },
    });
    await tx.documentAuditLog.create({
      data: {
        documentId: id,
        action: "SOFT_DELETE",
        actorId: null,
        ipAddress,
        userAgent,
        details: { previousStatus: existing.status },
      },
    });
    return updated;
  });

  return NextResponse.json({ ok: true, deletedAt: result.deletedAt });
}
