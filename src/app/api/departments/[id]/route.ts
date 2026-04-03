import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dept = await prisma.department.findUnique({
      where: { id },
      include: { employees: { select: { id: true, name: true, designation: true } } },
    });
    if (!dept) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(dept);
  } catch (error) {
    console.error("GET department error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
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
    if (body.name !== undefined) data.name = body.name;
    if (body.code !== undefined) data.code = body.code;
    if (body.description !== undefined) data.description = body.description || null;
    if (body.headId !== undefined) data.headId = body.headId || null;

    const updated = await prisma.department.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH department error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const empCount = await prisma.employee.count({ where: { departmentId: id } });
    if (empCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${empCount} employee(s) assigned to this department` },
        { status: 400 }
      );
    }
    await prisma.department.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE department error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
