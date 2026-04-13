import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const deals = await prisma.deal.findMany({ include: { client: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(deals);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const client = await prisma.client.create({
    data: {
      name: body.name, industry: body.industry, businessType: body.businessType,
      businessScale: body.businessScale, engagementLevel: body.engagementLevel,
      established: body.established ? Number(body.established) : null,
      website: body.website, linkedIn: body.linkedIn, instagram: body.instagram,
      headquarters: body.headquarters, officesInCities: body.officesInCities,
      notes: body.notes, status: "PROSPECT",
      contacts: body.contacts ? { create: body.contacts } : undefined,
    },
  });
  const deal = await prisma.deal.create({
    data: { clientId: client.id, title: body.name, stage: "LEAD", value: body.value ? Number(body.value) : null },
    include: { client: true },
  });
  return NextResponse.json(deal);
}
