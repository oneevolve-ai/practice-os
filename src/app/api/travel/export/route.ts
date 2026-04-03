import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { travelerName: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;

    const requests = await prisma.travelRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Title", "Traveler", "Origin", "Destination", "Travel Mode",
      "Departure Date", "Departure Time", "Return Date", "Return Time",
      "Purpose", "Estimated Cost", "Status", "Created At",
    ];

    const rows = requests.map((r) => [
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.travelerName.replace(/"/g, '""')}"`,
      `"${r.originCity || ""}"`,
      `"${r.destination.replace(/"/g, '""')}"`,
      r.travelMode,
      format(r.departureDate, "yyyy-MM-dd"),
      r.departureTime || "",
      format(r.returnDate, "yyyy-MM-dd"),
      r.returnTime || "",
      `"${r.purpose.replace(/"/g, '""')}"`,
      r.estimatedCost.toString(),
      r.status,
      format(r.createdAt, "yyyy-MM-dd HH:mm"),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="travel-requests-${format(new Date(), "yyyy-MM-dd")}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/travel/export error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
