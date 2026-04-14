import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposals = await prisma.clientProposal.findMany({
    where: { clientId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(proposals);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const proposal = await prisma.clientProposal.create({
    data: {
      clientId: id,
      title: body.title,
      value: body.value ? Number(body.value) : null,
      status: body.status || "DRAFT",
      sentDate: body.sentDate ? new Date(body.sentDate) : null,
    },
  });
  return NextResponse.json(proposal);
}
