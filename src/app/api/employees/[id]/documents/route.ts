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
    const docs = await prisma.employeeDocument.findMany({
      where: { employeeId: id },
      orderBy: { uploadedAt: "desc" },
    });
    return NextResponse.json(docs);
  } catch (error) {
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
    const docType = (formData.get("docType") as string) || "OTHER";

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadsDir = join(process.cwd(), "public", "uploads", "employees");
    await mkdir(uploadsDir, { recursive: true });

    const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    await writeFile(join(uploadsDir, uniqueName), buffer);

    const doc = await prisma.employeeDocument.create({
      data: {
        employeeId: id,
        docType,
        fileName: file.name,
        filePath: `/uploads/employees/${uniqueName}`,
        fileSize: file.size,
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
