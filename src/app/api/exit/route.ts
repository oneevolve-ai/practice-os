import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const exits = await prisma.exitManagement.findMany({
    include: { employee: { select: { name: true, designation: true, department: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(exits);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const exit = await prisma.exitManagement.create({
    data: {
      employeeId: body.employeeId,
      resignationDate: new Date(body.resignationDate),
      lastWorkingDay: new Date(body.lastWorkingDay),
      noticePeriod: Number(body.noticePeriod) || 60,
      reason: body.reason || null,
      exitType: body.exitType || "RESIGNATION",
      status: "NOTICE_PERIOD",
      clearance: {
        laptop: false, idCard: false, accessCard: false,
        emailDeactivated: false, documentHandover: false,
        financeCleared: false, hrCleared: false,
      },
    },
    include: { employee: { select: { name: true, designation: true, department: { select: { name: true } } } } },
  });

  // Update employee status
  await prisma.employee.update({
    where: { id: body.employeeId },
    data: { status: "OFFBOARDED" },
  });

  return NextResponse.json(exit);
}
