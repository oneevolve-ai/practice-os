import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const legs = await prisma.tripLeg.findMany({
      where: { requestId: id },
      orderBy: { legOrder: "asc" },
    });
    return NextResponse.json(legs);
  } catch (error) {
    console.error("GET legs error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const leg = await prisma.tripLeg.create({
      data: {
        requestId: id,
        legOrder: body.legOrder || 1,
        origin: body.origin,
        destination: body.destination,
        departureDate: new Date(body.departureDate),
        departureTime: body.departureTime || null,
        arrivalDate: new Date(body.arrivalDate),
        arrivalTime: body.arrivalTime || null,
        travelMode: body.travelMode || "FLIGHT",
        estimatedCost: body.estimatedCost || 0,
      },
    });

    return NextResponse.json(leg, { status: 201 });
  } catch (error) {
    console.error("POST leg error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const legId = searchParams.get("legId");

    if (legId) {
      await prisma.tripLeg.delete({ where: { id: legId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE leg error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
