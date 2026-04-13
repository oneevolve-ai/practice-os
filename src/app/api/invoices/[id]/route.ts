import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const invoice = await prisma.invoice.update({ where: { id: params.id }, data: body });
  return NextResponse.json(invoice);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.invoice.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
