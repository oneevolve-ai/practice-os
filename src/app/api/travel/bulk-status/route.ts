import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ids, status, comment, changedBy } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No requests selected" }, { status: 400 });
    }

    const requests = await prisma.travelRequest.findMany({
      where: { id: { in: ids } },
    });

    const operations = requests.flatMap((req) => [
      prisma.travelRequest.update({
        where: { id: req.id },
        data: { status },
      }),
      prisma.statusHistory.create({
        data: {
          requestId: req.id,
          fromStatus: req.status,
          toStatus: status,
          comment: comment || `Bulk ${status.toLowerCase()}`,
          changedBy: changedBy || "Manager",
        },
      }),
    ]);

    await prisma.$transaction(operations);

    return NextResponse.json({ success: true, updated: ids.length });
  } catch (error) {
    console.error("POST /api/travel/bulk-status error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
