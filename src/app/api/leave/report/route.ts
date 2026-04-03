import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const employees = await prisma.employee.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, department: { select: { name: true } } },
      orderBy: { name: "asc" },
    });

    const leaves = await prisma.leaveRequest.findMany({
      where: { status: "APPROVED", startDate: { gte: startOfYear, lte: endOfYear } },
    });

    const report = employees.map((emp) => {
      const empLeaves = leaves.filter((l) => l.employeeId === emp.id);
      const byType: Record<string, number> = {};
      for (const l of empLeaves) {
        byType[l.leaveType] = (byType[l.leaveType] || 0) + l.days;
      }
      return {
        id: emp.id, name: emp.name, department: emp.department?.name || "—",
        casual: byType.CASUAL || 0, sick: byType.SICK || 0,
        earned: byType.EARNED || 0, unpaid: byType.UNPAID || 0,
        compOff: byType.COMP_OFF || 0,
        total: empLeaves.reduce((s, l) => s + l.days, 0),
      };
    });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
