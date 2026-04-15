import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");
  const reviews = await prisma.performanceReview.findMany({
    where: employeeId ? { employeeId } : {},
    include: { employee: { select: { name: true, designation: true, department: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const review = await prisma.performanceReview.create({
    data: {
      employeeId: body.employeeId,
      reviewerId: body.reviewerId || null,
      period: body.period,
      year: Number(body.year),
      status: body.status || "DRAFT",
      notes: body.notes || null,
      kras: body.kras || [],
      overallRating: body.overallRating ? Number(body.overallRating) : null,
    },
    include: { employee: { select: { name: true, designation: true, department: { select: { name: true } } } } },
  });
  return NextResponse.json(review);
}
