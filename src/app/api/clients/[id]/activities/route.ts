import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activities = await prisma.cRMActivity.findMany({
    where: { clientId: id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const activity = await prisma.cRMActivity.create({
    data: {
      clientId: id,
      type: body.type,
      notes: body.notes,
      date: body.date ? new Date(body.date) : new Date(),
    },
  });
  return NextResponse.json(activity);
}
