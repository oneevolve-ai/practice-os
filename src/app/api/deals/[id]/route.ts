import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const deal = await prisma.deal.update({
    where: { id },
    data: {
      ...body,
      closeDate: body.closeDate ? new Date(body.closeDate) : undefined,
      probability: body.probability ? Number(body.probability) : undefined,
      value: body.value ? Number(body.value) : undefined,
    },
  });
  return NextResponse.json(deal);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.deal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
