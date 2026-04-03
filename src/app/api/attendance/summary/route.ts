import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const where: Record<string, unknown> = {
      date: { gte: startDate, lte: endDate },
    };
    if (employeeId) where.employeeId = employeeId;

    const records = await prisma.attendance.findMany({ where });

    const summary = {
      present: records.filter((r) => r.status === "PRESENT").length,
      absent: records.filter((r) => r.status === "ABSENT").length,
      halfDay: records.filter((r) => r.status === "HALF_DAY").length,
      wfh: records.filter((r) => r.status === "WFH").length,
      onLeave: records.filter((r) => r.status === "ON_LEAVE").length,
      totalWorkHours: Math.round(records.reduce((sum, r) => sum + (r.workHours || 0), 0) * 100) / 100,
      totalRecords: records.length,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("GET /api/attendance/summary error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
