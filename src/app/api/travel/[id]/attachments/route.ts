import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attachments = await prisma.attachment.findMany({
      where: { requestId: id },
      orderBy: { uploadedAt: "desc" },
    });
    return NextResponse.json(attachments);
  } catch (error) {
    console.error("GET attachments error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = join(uploadsDir, uniqueName);
    await writeFile(filePath, buffer);

    const attachment = await prisma.attachment.create({
      data: {
        requestId: id,
        fileName: file.name,
        filePath: `/uploads/${uniqueName}`,
        fileSize: file.size,
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("POST attachment error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
