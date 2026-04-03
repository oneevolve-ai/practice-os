import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { travelerName: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.departureDate = {};
      if (dateFrom) (where.departureDate as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.departureDate as Record<string, unknown>).lte = new Date(dateTo);
    }

    const requests = await prisma.travelRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error("GET /api/travel error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const travelRequest = await prisma.travelRequest.create({
      data: {
        title: body.title,
        travelerName: body.travelerName,
        originCity: body.originCity || null,
        destination: body.destination,
        departureDate: new Date(body.departureDate),
        departureTime: body.departureTime || null,
        returnDate: new Date(body.returnDate),
        returnTime: body.returnTime || null,
        travelMode: body.travelMode || "FLIGHT",
        purpose: body.purpose,
        estimatedCost: body.estimatedCost || 0,
        selectedOffer: body.selectedOffer || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json(travelRequest, { status: 201 });
  } catch (error) {
    console.error("POST /api/travel error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
