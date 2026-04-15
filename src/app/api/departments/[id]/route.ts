import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dept = await prisma.department.findUnique({
    where: { id },
    include: { _count: { select: { employees: true } } },
  });
  if (!dept) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(dept);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const dept = await prisma.department.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      defaultBasicMin: body.defaultBasicMin ? Number(body.defaultBasicMin) : null,
      defaultBasicMax: body.defaultBasicMax ? Number(body.defaultBasicMax) : null,
    },
  });
  return NextResponse.json(dept);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.department.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
