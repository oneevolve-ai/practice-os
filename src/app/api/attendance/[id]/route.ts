import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.status !== undefined) data.status = body.status;
    if (body.checkIn !== undefined) data.checkIn = body.checkIn;
    if (body.checkOut !== undefined) data.checkOut = body.checkOut;
    if (body.notes !== undefined) data.notes = body.notes;

    // Auto-calculate work hours
    const current = await prisma.attendance.findUnique({ where: { id } });
    const checkIn = body.checkIn || current?.checkIn;
    const checkOut = body.checkOut || current?.checkOut;
    if (checkIn && checkOut) {
      const [inH, inM] = checkIn.split(":").map(Number);
      const [outH, outM] = checkOut.split(":").map(Number);
      data.workHours = Math.round(((outH * 60 + outM) - (inH * 60 + inM)) / 60 * 100) / 100;
    }

    const updated = await prisma.attendance.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH attendance error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
