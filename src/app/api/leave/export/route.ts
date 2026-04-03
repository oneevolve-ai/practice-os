import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const leaves = await prisma.leaveRequest.findMany({
      where: { startDate: { gte: startOfYear, lte: endOfYear } },
      include: { employee: { select: { name: true, department: { select: { name: true } } } } },
      orderBy: { startDate: "desc" },
    });

    const headers = ["Employee", "Department", "Leave Type", "Half Day", "Start Date", "End Date", "Days", "Status", "Reason"];
    const rows = leaves.map((l) => [
      `"${l.employee.name}"`,
      `"${l.employee.department?.name || ""}"`,
      l.leaveType,
      l.halfDayType,
      format(l.startDate, "yyyy-MM-dd"),
      format(l.endDate, "yyyy-MM-dd"),
      l.days.toString(),
      l.status,
      `"${(l.reason || "").replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leave-report-${year}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
