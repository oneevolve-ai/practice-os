import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const req = await prisma.regularizationRequest.findUnique({ where: { id } });
    if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.regularizationRequest.update({
      where: { id },
      data: {
        status: body.status,
        reviewedBy: body.reviewedBy || null,
        reviewNote: body.reviewNote || null,
      },
    });

    // On approval, update attendance
    if (body.status === "APPROVED") {
      const date = new Date(req.date);
      date.setHours(0, 0, 0, 0);

      const existing = await prisma.attendance.findFirst({
        where: { employeeId: req.employeeId, date: { gte: date, lt: new Date(date.getTime() + 86400000) } },
      });

      let workHours: number | null = null;
      const checkIn = req.requestedCheckIn;
      const checkOut = req.requestedCheckOut;
      if (checkIn && checkOut) {
        const [inH, inM] = checkIn.split(":").map(Number);
        const [outH, outM] = checkOut.split(":").map(Number);
        workHours = Math.round(((outH * 60 + outM) - (inH * 60 + inM)) / 60 * 100) / 100;
      }

      const lateArrival = checkIn ? checkIn > "09:30" : false;

      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            checkIn: checkIn || existing.checkIn,
            checkOut: checkOut || existing.checkOut,
            workHours: workHours ?? existing.workHours,
            lateArrival,
            status: "PRESENT",
          },
        });
      } else {
        await prisma.attendance.create({
          data: {
            employeeId: req.employeeId,
            date,
            checkIn, checkOut, workHours, lateArrival,
            status: "PRESENT",
          },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
