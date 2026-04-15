import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = await prisma.performanceReview.findUnique({
    where: { id },
    include: { employee: { select: { name: true, designation: true, department: { select: { name: true } } } } },
  });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(review);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const review = await prisma.performanceReview.update({
    where: { id },
    data: {
      status: body.status,
      notes: body.notes,
      kras: body.kras,
      overallRating: body.overallRating ? Number(body.overallRating) : null,
    },
  });
  return NextResponse.json(review);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.performanceReview.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
