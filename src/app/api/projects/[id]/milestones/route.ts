import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const milestone = await prisma.milestone.create({
    data: {
      projectId: id,
      title: body.title,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      completed: body.completed || false,
    },
  });
  return NextResponse.json(milestone);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const milestone = await prisma.milestone.update({
    where: { id: body.milestoneId },
    data: { completed: body.completed },
  });
  return NextResponse.json(milestone);
}
