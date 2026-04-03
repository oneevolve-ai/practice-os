import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "node:fs/promises";
import { join } from "node:path";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { docId } = await params;
    const doc = await prisma.employeeDocument.findUnique({ where: { id: docId } });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try { await unlink(join(process.cwd(), "public", doc.filePath)); } catch {}

    await prisma.employeeDocument.delete({ where: { id: docId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
