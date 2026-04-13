import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({ where: { id: params.id }, include: { contacts: true, deals: true, activities: { orderBy: { date: "desc" } }, proposals: true } });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const client = await prisma.client.update({ where: { id: params.id }, data: body, include: { contacts: true, deals: true } });
  return NextResponse.json(client);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.client.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
