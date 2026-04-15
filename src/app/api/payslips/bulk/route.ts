import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { month, year, defaultBasic, defaultHra, defaultAllowances, status } = body;

  if (!month || !year) return NextResponse.json({ error: "Month and year required" }, { status: 400 });

  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, basicSalary: true, hra: true, allowances: true },
  });

  const created: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  for (const emp of employees) {
    // Skip if payslip already exists for this month/year
    const existing = await prisma.payslip.findFirst({
      where: { employeeId: emp.id, month, year },
    });
    if (existing) { skipped.push(emp.name); continue; }

    const basic = emp.basicSalary || Number(defaultBasic) || 0;
    if (basic === 0) { skipped.push(`${emp.name} (no salary)`); continue; }

    const hra = emp.hra || Number(defaultHra) || Math.round(basic * 0.4);
    const allowances = emp.allowances || Number(defaultAllowances) || 0;
    const grossSalary = basic + hra + allowances;
    const pfDeduction = Math.round(basic * 0.12);
    const esiDeduction = grossSalary <= 21000 ? Math.round(grossSalary * 0.0075) : 0;
    const netSalary = grossSalary - pfDeduction - esiDeduction;

    try {
      await prisma.payslip.create({
        data: {
          employeeId: emp.id,
          month: Number(month),
          year: Number(year),
          basicSalary: basic,
          hra,
          allowances,
          grossSalary,
          pfDeduction,
          esiDeduction,
          otherDeductions: 0,
          netSalary,
          workingDays: 26,
          presentDays: 26,
          status: status || "DRAFT",
        },
      });
      created.push(emp.name);
    } catch (e: any) {
      errors.push(`${emp.name}: ${e.message?.slice(0, 60)}`);
    }
  }

  return NextResponse.json({ created: created.length, skipped: skipped.length, errors });
}
