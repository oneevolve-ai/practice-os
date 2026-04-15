import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const OFFICE_START = "09:30";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, action, latitude, longitude, location } = body;

    if (!employeeId || !action) {
      return NextResponse.json({ error: "employeeId and action required" }, { status: 400 });
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const existing = await prisma.attendance.findFirst({
      where: { employeeId, date: { gte: today, lt: new Date(today.getTime() + 86400000) } },
    });

    if (action === "CHECK_IN") {
      const lateArrival = timeStr > OFFICE_START;

      const data: Record<string, unknown> = {
        checkIn: timeStr,
        status: "PRESENT",
        lateArrival,
      };

      // Store location if provided
      if (latitude && longitude) {
        data.checkInLat = parseFloat(latitude);
        data.checkInLng = parseFloat(longitude);
        data.checkInLocation = location || null;
      }

      if (existing) {
        const updated = await prisma.attendance.update({ where: { id: existing.id }, data });
        return NextResponse.json(updated);
      } else {
        const created = await prisma.attendance.create({
          data: { employeeId, date: today, ...data },
        });
        return NextResponse.json(created, { status: 201 });
      }
    } else if (action === "WFH") {
      const data = {
        checkIn: timeStr,
        status: "WFH",
        lateArrival: false,
        checkInLocation: "Work From Home",
      };
      if (existing) {
        const updated = await prisma.attendance.update({ where: { id: existing.id }, data });
        return NextResponse.json(updated);
      } else {
        const created = await prisma.attendance.create({
          data: { employeeId, date: today, ...data },
        });
        return NextResponse.json(created, { status: 201 });
      }
    } else if (action === "CHECK_OUT") {
      if (!existing) {
        return NextResponse.json({ error: "No check-in found for today" }, { status: 400 });
      }
      let workHours: number | null = null;
      if (existing.checkIn) {
        const [inH, inM] = existing.checkIn.split(":").map(Number);
        const [outH, outM] = timeStr.split(":").map(Number);
        workHours = Math.round(((outH * 60 + outM) - (inH * 60 + inM)) / 60 * 100) / 100;
      }
      const earlyDepart = timeStr < "18:00";
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: { checkOut: timeStr, workHours, earlyDepart },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/attendance/check-in error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
