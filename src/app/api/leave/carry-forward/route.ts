import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LEAVE_ALLOCATIONS: Record<string, number> = {
  CASUAL: 12, SICK: 10, PRIVILEGE: 15, EARNED: 15, UNPAID: 0, COMP_OFF: 0,
};

const MAX_CARRY: Record<string, number> = {
  CASUAL: 5, SICK: 0, PRIVILEGE: 15, EARNED: 15, UNPAID: 0, COMP_OFF: 2,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") || `${new Date().getFullYear()}`);
  const records = await prisma.leaveCarryForward.findMany({
    where: { toYear: year },
    include: { employee: { select: { name: true, department: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const fromYear = parseInt(body.fromYear) || new Date().getFullYear() - 1;
  const toYear = fromYear + 1;
  const leaveTypes = ["CASUAL", "PRIVILEGE", "EARNED", "COMP_OFF"];

  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
  });

  const results: string[] = [];
  const skipped: string[] = [];

  for (const emp of employees) {
    for (const leaveType of leaveTypes) {
      const maxCarry = MAX_CARRY[leaveType];
      if (maxCarry === 0) continue;

      // Check if already carried forward
      const existing = await prisma.leaveCarryForward.findFirst({
        where: { employeeId: emp.id, leaveType, fromYear, toYear },
      });
      if (existing) { skipped.push(`${emp.name} - ${leaveType}`); continue; }

      // Calculate used leaves in fromYear
      const startDate = new Date(fromYear, 0, 1);
      const endDate = new Date(fromYear, 11, 31);
      const used = await prisma.leaveRequest.findMany({
        where: { employeeId: emp.id, leaveType, status: "APPROVED", startDate: { gte: startDate, lte: endDate } },
      });
      const usedDays = used.reduce((s, l) => s + Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000) + 1, 0);
      const allocation = LEAVE_ALLOCATIONS[leaveType] || 0;
      const unused = Math.max(0, allocation - usedDays);
      const daysCarried = Math.min(unused, maxCarry);

      if (daysCarried > 0) {
        await prisma.leaveCarryForward.create({
          data: { employeeId: emp.id, leaveType, fromYear, toYear, daysCarried },
        });
        results.push(`${emp.name} - ${leaveType}: ${daysCarried} days`);
      }
    }
  }

  return NextResponse.json({ carried: results.length, skipped: skipped.length, results });
}
