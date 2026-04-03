import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [pending, approvedThisMonth, upcoming, onLeaveToday] = await Promise.all([
      prisma.leaveRequest.count({ where: { status: "PENDING" } }),
      prisma.leaveRequest.count({ where: { status: "APPROVED", startDate: { gte: startOfMonth, lte: endOfMonth } } }),
      prisma.leaveRequest.count({ where: { status: "APPROVED", startDate: { gt: now } } }),
      prisma.leaveRequest.findMany({
        where: { status: "APPROVED", startDate: { lte: now }, endDate: { gte: now } },
        include: { employee: { select: { name: true, designation: true } } },
      }),
    ]);

    return NextResponse.json({ pending, approvedThisMonth, upcoming, onLeaveToday });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
