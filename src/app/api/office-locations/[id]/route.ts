import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.address !== undefined) data.address = body.address;
    if (body.latitude !== undefined) data.latitude = parseFloat(body.latitude);
    if (body.longitude !== undefined) data.longitude = parseFloat(body.longitude);
    if (body.radius !== undefined) data.radius = parseInt(body.radius);
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const updated = await prisma.officeLocation.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.officeLocation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
