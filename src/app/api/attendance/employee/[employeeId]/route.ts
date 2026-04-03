import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [records, employee] = await Promise.all([
      prisma.attendance.findMany({
        where: { employeeId, date: { gte: startDate, lte: endDate } },
        orderBy: { date: "asc" },
      }),
      prisma.employee.findUnique({
        where: { id: employeeId },
        select: { name: true, department: { select: { name: true } } },
      }),
    ]);

    const stats = {
      present: records.filter((r) => r.status === "PRESENT").length,
      absent: records.filter((r) => r.status === "ABSENT").length,
      halfDay: records.filter((r) => r.status === "HALF_DAY").length,
      wfh: records.filter((r) => r.status === "WFH").length,
      onLeave: records.filter((r) => r.status === "ON_LEAVE").length,
      lateCount: records.filter((r) => r.lateArrival).length,
      totalWorkHours: Math.round(records.reduce((s, r) => s + (r.workHours || 0), 0) * 100) / 100,
      avgWorkHours: records.filter((r) => r.workHours).length > 0
        ? Math.round(records.reduce((s, r) => s + (r.workHours || 0), 0) / records.filter((r) => r.workHours).length * 100) / 100
        : 0,
    };

    return NextResponse.json({ employee, records, stats });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
