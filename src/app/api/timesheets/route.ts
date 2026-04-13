import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const timesheets = await prisma.timesheet.findMany({
    where: projectId ? { projectId } : {},
    include: { project: { select: { name: true } } },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(timesheets);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const timesheet = await prisma.timesheet.create({
    data: {
      projectId: body.projectId,
      employeeName: body.employeeName,
      date: body.date ? new Date(body.date) : new Date(),
      hours: Number(body.hours),
      description: body.description,
      billable: body.billable !== false,
    },
    include: { project: { select: { name: true } } },
  });
  return NextResponse.json(timesheet);
}
