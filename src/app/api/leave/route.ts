import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId") || "";
    const status = searchParams.get("status") || "";
    const leaveType = searchParams.get("leaveType") || "";
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (leaveType) where.leaveType = leaveType;

    if (month && year) {
      const m = parseInt(month);
      const y = parseInt(year);
      const startOfMonth = new Date(y, m - 1, 1);
      const endOfMonth = new Date(y, m, 0, 23, 59, 59);
      where.OR = [
        { startDate: { gte: startOfMonth, lte: endOfMonth } },
        { endDate: { gte: startOfMonth, lte: endOfMonth } },
        { AND: [{ startDate: { lte: startOfMonth } }, { endDate: { gte: endOfMonth } }] },
      ];
    }

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: { employee: { select: { name: true, department: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(leaves);
  } catch (error) {
    console.error("GET /api/leave error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, leaveType, startDate, endDate, days, reason, halfDayType } = body;

    // Validation 1: Overlap check
    const overlaps = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        status: { in: ["APPROVED", "PENDING"] },
        startDate: { lte: new Date(endDate) },
        endDate: { gte: new Date(startDate) },
      },
    });
    if (overlaps.length > 0) {
      return NextResponse.json({ error: "Leave dates overlap with an existing request" }, { status: 400 });
    }

    // Validation 2: Policy checks
    const policy = await prisma.leavePolicy.findUnique({ where: { leaveType } });
    if (policy) {
      // Balance check
      if (!policy.isUnlimited) {
        const year = new Date().getFullYear();
        const used = await prisma.leaveRequest.aggregate({
          where: { employeeId, leaveType, status: "APPROVED", startDate: { gte: new Date(year, 0, 1) } },
          _sum: { days: true },
        });
        const remaining = policy.allocation - (used._sum.days || 0);
        if (days > remaining) {
          return NextResponse.json({ error: `Insufficient ${leaveType} balance. Available: ${remaining} days` }, { status: 400 });
        }
      }

      // Min advance notice
      if (policy.minAdvanceDays > 0) {
        const daysUntil = Math.ceil((new Date(startDate).getTime() - Date.now()) / 86400000);
        if (daysUntil < policy.minAdvanceDays) {
          return NextResponse.json({ error: `${leaveType} requires ${policy.minAdvanceDays} days advance notice` }, { status: 400 });
        }
      }

      // Max consecutive
      if (policy.maxConsecutive > 0 && days > policy.maxConsecutive) {
        return NextResponse.json({ error: `${leaveType} allows max ${policy.maxConsecutive} consecutive days` }, { status: 400 });
      }
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType,
        halfDayType: halfDayType || "FULL_DAY",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        reason: reason || null,
      },
    });
    return NextResponse.json(leave, { status: 201 });
  } catch (error) {
    console.error("POST /api/leave error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
