import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    include: { timesheets: true, milestones: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const project = await prisma.project.create({
    data: {
      name: body.name,
      code: body.code,
      clientName: body.clientName,
      type: body.type || "Digital Twin",
      status: body.status || "PLANNING",
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      budget: body.budget ? Number(body.budget) : null,
      billingType: body.billingType || "Fixed Fee",
      description: body.description,
    },
    include: { timesheets: true, milestones: true },
  });
  return NextResponse.json(project);
}
