import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const requests = await prisma.regularizationRequest.findMany({
      where,
      include: { employee: { select: { name: true, department: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const req = await prisma.regularizationRequest.create({
      data: {
        employeeId: body.employeeId,
        date: new Date(body.date),
        requestedCheckIn: body.requestedCheckIn || null,
        requestedCheckOut: body.requestedCheckOut || null,
        reason: body.reason,
      },
    });
    return NextResponse.json(req, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
