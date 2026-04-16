import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const travelRequest = await prisma.travelRequest.findUnique({
      where: { id },
      include: {
        statusHistory: { orderBy: { changedAt: "asc" } },
        attachments: { orderBy: { uploadedAt: "desc" } },
      },
    });

    if (!travelRequest) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(travelRequest);
  } catch (error) {
    console.error("GET /api/travel/[id] error:", error);
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
    if (body.title !== undefined) data.title = body.title;
    if (body.travelerName !== undefined) data.travelerName = body.travelerName;
    if (body.originCity !== undefined) data.originCity = body.originCity || null;
    if (body.destination !== undefined) data.destination = body.destination;
    if (body.departureDate !== undefined) data.departureDate = new Date(body.departureDate);
    if (body.departureTime !== undefined) data.departureTime = body.departureTime || null;
    if (body.returnDate !== undefined) data.returnDate = new Date(body.returnDate);
    if (body.returnTime !== undefined) data.returnTime = body.returnTime || null;
    if (body.travelMode !== undefined) data.travelMode = body.travelMode;
    if (body.purpose !== undefined) data.purpose = body.purpose;
    if (body.estimatedCost !== undefined) data.estimatedCost = body.estimatedCost;
    if (body.selectedOffer !== undefined) data.selectedOffer = body.selectedOffer;
    if (body.bookedFlight !== undefined) data.bookedFlight = body.bookedFlight;
    if (body.notes !== undefined) data.notes = body.notes || null;
    if (body.status !== undefined) data.status = body.status;

    const updated = await prisma.travelRequest.update({
      where: { id },
      data,
      include: {
        statusHistory: { orderBy: { changedAt: "asc" } },
        attachments: { orderBy: { uploadedAt: "desc" } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/travel/[id] error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.travelRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/travel/[id] error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
