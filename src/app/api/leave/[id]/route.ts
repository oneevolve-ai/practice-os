import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: { include: { department: true } } },
    });
    if (!leave) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(leave);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function syncLeaveAttendance(
  employeeId: string,
  startDate: Date,
  endDate: Date,
  halfDayType: string,
  action: "create" | "remove"
) {
  // Get holidays for the date range
  const holidays = await prisma.holiday.findMany({
    where: { date: { gte: startDate, lte: endDate } },
  });
  const holidayDates = new Set(holidays.map((h) => h.date.toISOString().slice(0, 10)));

  const day = new Date(startDate);
  while (day <= endDate) {
    const dow = day.getDay();
    const dateStr = day.toISOString().slice(0, 10);

    // Skip weekends and holidays
    if (dow !== 0 && dow !== 6 && !holidayDates.has(dateStr)) {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);

      if (action === "create") {
        const status = halfDayType !== "FULL_DAY" ? "HALF_DAY" : "ON_LEAVE";
        // Upsert attendance
        const existing = await prisma.attendance.findFirst({
          where: { employeeId, date: { gte: dayStart, lt: new Date(dayStart.getTime() + 86400000) } },
        });
        if (existing) {
          await prisma.attendance.update({
            where: { id: existing.id },
            data: { status, isLeave: true },
          });
        } else {
          await prisma.attendance.create({
            data: { employeeId, date: dayStart, status, isLeave: true },
          });
        }
      } else {
        // Remove leave attendance
        const existing = await prisma.attendance.findFirst({
          where: { employeeId, date: { gte: dayStart, lt: new Date(dayStart.getTime() + 86400000) }, isLeave: true },
        });
        if (existing) {
          await prisma.attendance.delete({ where: { id: existing.id } });
        }
      }
    }
    day.setDate(day.getDate() + 1);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.reviewedBy !== undefined) data.reviewedBy = body.reviewedBy;
    if (body.reviewNote !== undefined) data.reviewNote = body.reviewNote;

    const current = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.leaveRequest.update({ where: { id }, data });

    // Sync attendance on status change
    if (body.status === "APPROVED" && current.status !== "APPROVED") {
      await syncLeaveAttendance(
        current.employeeId, current.startDate, current.endDate,
        current.halfDayType, "create"
      );
    } else if (
      (body.status === "CANCELLED" || body.status === "REJECTED") &&
      current.status === "APPROVED"
    ) {
      await syncLeaveAttendance(
        current.employeeId, current.startDate, current.endDate,
        current.halfDayType, "remove"
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH leave error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.leaveRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
