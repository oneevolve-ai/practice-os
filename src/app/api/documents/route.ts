import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const docs = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(docs);
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const doc = await prisma.document.create({
      data: {
        title: body.title,
        category: body.category || "Other",
        description: body.description,
        fileUrl: body.fileUrl,
        fileType: body.fileType,
        tags: body.tags,
        projectName: body.projectName,
        clientName: body.clientName,
        createdBy: body.createdBy,
      },
    });
    return NextResponse.json(doc);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
