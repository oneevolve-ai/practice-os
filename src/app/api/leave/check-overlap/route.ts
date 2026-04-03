import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const excludeId = searchParams.get("excludeId");

    if (!employeeId || !startDate || !endDate) {
      return NextResponse.json({ error: "employeeId, startDate, endDate required" }, { status: 400 });
    }

    const where: Record<string, unknown> = {
      employeeId,
      status: { in: ["APPROVED", "PENDING"] },
      startDate: { lte: new Date(endDate) },
      endDate: { gte: new Date(startDate) },
    };
    if (excludeId) where.id = { not: excludeId };

    const conflicts = await prisma.leaveRequest.findMany({
      where,
      include: { employee: { select: { name: true } } },
    });

    return NextResponse.json({
      hasOverlap: conflicts.length > 0,
      conflicts,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
