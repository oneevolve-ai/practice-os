import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId");
  const payslips = await prisma.payslip.findMany({
    where: employeeId ? { employeeId } : {},
    include: { employee: { select: { name: true, designation: true, department: { select: { name: true } } } } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
  return NextResponse.json(payslips);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const basic = Number(body.basicSalary) || 0;
  const hra = Number(body.hra) || 0;
  const allowances = Number(body.allowances) || 0;
  const grossSalary = basic + hra + allowances;
  const pfDeduction = Number(body.pfDeduction) || Math.round(basic * 0.12);
  const esiDeduction = Number(body.esiDeduction) || (grossSalary <= 21000 ? Math.round(grossSalary * 0.0075) : 0);
  const otherDeductions = Number(body.otherDeductions) || 0;
  const netSalary = grossSalary - pfDeduction - esiDeduction - otherDeductions;

  const payslip = await prisma.payslip.create({
    data: {
      employeeId: body.employeeId,
      month: Number(body.month),
      year: Number(body.year),
      basicSalary: basic,
      hra,
      allowances,
      grossSalary,
      pfDeduction,
      esiDeduction,
      otherDeductions,
      netSalary,
      workingDays: Number(body.workingDays) || 26,
      presentDays: Number(body.presentDays) || 26,
      status: body.status || "DRAFT",
      notes: body.notes,
    },
    include: { employee: { select: { name: true, designation: true, department: { select: { name: true } } } } },
  });
  return NextResponse.json(payslip);
}
