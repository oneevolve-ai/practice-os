import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const employeeId = searchParams.get("employeeId");

    const where: Record<string, unknown> = {};
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.date = { gte: d, lt: next };
    }
    if (employeeId) where.employeeId = employeeId;

    const records = await prisma.attendance.findMany({
      where,
      include: { employee: { select: { name: true, department: { select: { name: true } } } } },
      orderBy: { employee: { name: "asc" } },
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error("GET /api/attendance error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Upsert: create or update attendance for this employee+date
    const date = new Date(body.date);
    date.setHours(0, 0, 0, 0);

    let workHours: number | null = null;
    if (body.checkIn && body.checkOut) {
      const [inH, inM] = body.checkIn.split(":").map(Number);
      const [outH, outM] = body.checkOut.split(":").map(Number);
      workHours = Math.round(((outH * 60 + outM) - (inH * 60 + inM)) / 60 * 100) / 100;
    }

    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId: body.employeeId,
        date: { gte: date, lt: new Date(date.getTime() + 86400000) },
      },
    });

    let record;
    if (existing) {
      record = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          status: body.status || existing.status,
          checkIn: body.checkIn !== undefined ? body.checkIn : existing.checkIn,
          checkOut: body.checkOut !== undefined ? body.checkOut : existing.checkOut,
          workHours: workHours !== null ? workHours : existing.workHours,
          notes: body.notes !== undefined ? body.notes : existing.notes,
        },
      });
    } else {
      record = await prisma.attendance.create({
        data: {
          employeeId: body.employeeId,
          date,
          status: body.status || "PRESENT",
          checkIn: body.checkIn || null,
          checkOut: body.checkOut || null,
          workHours,
          notes: body.notes || null,
        },
      });
    }

    return NextResponse.json(record, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("POST /api/attendance error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
