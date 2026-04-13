import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const visitors = await prisma.visitor.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(visitors);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const visitor = await prisma.visitor.create({
    data: {
      name: body.name,
      company: body.company,
      phone: body.phone,
      email: body.email,
      purpose: body.purpose,
      hostName: body.hostName,
      hostPhone: body.hostPhone,
      expectedTime: body.expectedTime ? new Date(body.expectedTime) : null,
      notes: body.notes,
      status: "EXPECTED",
    },
  });
  return NextResponse.json(visitor);
}
