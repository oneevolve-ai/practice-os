import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const deal = await prisma.deal.update({ where: { id: params.id }, data: body, include: { client: true } });
  return NextResponse.json(deal);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.deal.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const deal = await prisma.deal.findUnique({ where: { id: params.id }, include: { client: { include: { contacts: true } } } });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(deal);
}
