import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const records = await prisma.leaveEncashment.findMany({
    include: { employee: { select: { name: true, department: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const record = await prisma.leaveEncashment.create({
    data: {
      employeeId: body.employeeId,
      leaveType: body.leaveType,
      days: Number(body.days),
      perDayAmount: Number(body.perDayAmount),
      totalAmount: Number(body.totalAmount),
      year: Number(body.year),
      status: "PENDING",
      notes: body.notes || null,
    },
    include: { employee: { select: { name: true, department: { select: { name: true } } } } },
  });
  return NextResponse.json(record);
}
