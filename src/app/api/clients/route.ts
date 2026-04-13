import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const clients = await prisma.client.findMany({ include: { contacts: true, deals: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const client = await prisma.client.create({
    data: {
      name: body.name, uin: body.uin, businessType: body.businessType,
      businessScale: body.businessScale, engagementLevel: body.engagementLevel,
      established: body.established ? Number(body.established) : null,
      accountManager: body.accountManager, industry: body.industry,
      website: body.website, linkedIn: body.linkedIn, instagram: body.instagram,
      email: body.email, phone: body.phone, headquarters: body.headquarters,
      officesInCities: body.officesInCities, gstin: body.gstin, pan: body.pan,
      notes: body.notes, status: body.status || "PROSPECT",
      contacts: body.contacts ? { create: body.contacts } : undefined,
    },
    include: { contacts: true, deals: true },
  });
  return NextResponse.json(client);
}
