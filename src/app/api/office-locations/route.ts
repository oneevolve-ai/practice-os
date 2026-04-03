import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const locations = await prisma.officeLocation.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const location = await prisma.officeLocation.create({
      data: {
        name: body.name,
        address: body.address || null,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        radius: parseInt(body.radius) || 200,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
