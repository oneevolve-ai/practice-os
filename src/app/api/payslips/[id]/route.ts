import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payslip = await prisma.payslip.findUnique({
    where: { id },
    include: { employee: { select: { name: true, designation: true, pfNumber: true, esiNumber: true, department: { select: { name: true } } } } },
  });
  if (!payslip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(payslip);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const payslip = await prisma.payslip.update({ where: { id }, data: body });
  return NextResponse.json(payslip);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.payslip.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
