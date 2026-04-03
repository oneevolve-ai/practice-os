import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { employees: true } } },
    });
    return NextResponse.json(departments);
  } catch (error) {
    console.error("GET /api/departments error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const department = await prisma.department.create({
      data: {
        name: body.name,
        code: body.code,
        description: body.description || null,
        headId: body.headId || null,
      },
    });
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error("POST /api/departments error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
