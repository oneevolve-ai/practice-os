import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    const mapped = deals.map(d => ({ ...d, clientName: d.client.name }));
    return NextResponse.json(mapped);
  } catch { return NextResponse.json([]); }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const deal = await prisma.deal.create({
    data: {
      clientId: body.clientId,
      title: body.title,
      stage: body.stage || "LEAD",
      value: body.value ? Number(body.value) : null,
      notes: body.notes || null,
      closeDate: body.closeDate ? new Date(body.closeDate) : null,
      probability: body.probability ? Number(body.probability) : null,
    },
    include: { client: { select: { name: true } } },
  });
  return NextResponse.json({ ...deal, clientName: deal.client.name });
}
