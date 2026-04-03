import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [total, active, deptCount, licensed] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: "ACTIVE" } }),
      prisma.department.count(),
      prisma.employee.count({ where: { OR: [{ isPE: true }, { isRA: true }] } }),
    ]);

    return NextResponse.json({ total, active, departments: deptCount, licensed });
  } catch (error) {
    console.error("GET /api/employees/stats error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
