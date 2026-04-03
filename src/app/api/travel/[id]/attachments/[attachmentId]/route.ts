import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "node:fs/promises";
import { join } from "node:path";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const { attachmentId } = await params;

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete file from disk
    try {
      const filePath = join(process.cwd(), "public", attachment.filePath);
      await unlink(filePath);
    } catch {
      // File may already be deleted, continue
    }

    await prisma.attachment.delete({ where: { id: attachmentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE attachment error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
