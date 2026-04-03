import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const type = searchParams.get("type") || "";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};

    if (from && to) {
      where.date = { gte: new Date(from), lte: new Date(to) };
    } else {
      where.year = year;
    }
    if (type) where.type = type;

    const holidays = await prisma.holiday.findMany({
      where,
      orderBy: { date: "asc" },
    });
    return NextResponse.json(holidays);
  } catch (error) {
    console.error("GET /api/holidays error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const date = new Date(body.date);
    const holiday = await prisma.holiday.create({
      data: {
        date,
        name: body.name,
        type: body.type || "NATIONAL",
        year: date.getFullYear(),
      },
    });
    return NextResponse.json(holiday, { status: 201 });
  } catch (error) {
    console.error("POST /api/holidays error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
