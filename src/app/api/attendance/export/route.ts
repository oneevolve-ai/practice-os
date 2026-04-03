import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const employees = await prisma.employee.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, department: { select: { name: true } } },
      orderBy: { name: "asc" },
    });

    const records = await prisma.attendance.findMany({
      where: { date: { gte: startDate, lte: endDate } },
    });

    const headers = ["Employee", "Department", "Present", "Absent", "WFH", "On Leave", "Half Day", "Total Hours", "Avg Hours", "Late Count"];
    const rows = employees.map((emp) => {
      const empRecs = records.filter((r) => r.employeeId === emp.id);
      return [
        `"${emp.name}"`,
        `"${emp.department?.name || ""}"`,
        empRecs.filter((r) => r.status === "PRESENT").length,
        empRecs.filter((r) => r.status === "ABSENT").length,
        empRecs.filter((r) => r.status === "WFH").length,
        empRecs.filter((r) => r.status === "ON_LEAVE").length,
        empRecs.filter((r) => r.status === "HALF_DAY").length,
        Math.round(empRecs.reduce((s, r) => s + (r.workHours || 0), 0) * 100) / 100,
        empRecs.filter((r) => r.workHours).length > 0
          ? Math.round(empRecs.reduce((s, r) => s + (r.workHours || 0), 0) / empRecs.filter((r) => r.workHours).length * 100) / 100 : 0,
        empRecs.filter((r) => r.lateArrival).length,
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long" });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="attendance-${monthName}-${year}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
