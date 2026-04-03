import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [total, pending, upcoming, monthlySpendResult] = await Promise.all([
      prisma.travelRequest.count(),
      prisma.travelRequest.count({ where: { status: "PENDING" } }),
      prisma.travelRequest.count({
        where: { departureDate: { gte: now }, status: { notIn: ["CANCELLED", "REJECTED"] } },
      }),
      prisma.travelRequest.aggregate({
        _sum: { estimatedCost: true },
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          status: { notIn: ["CANCELLED", "REJECTED"] },
        },
      }),
    ]);

    return NextResponse.json({
      total,
      pending,
      upcoming,
      monthlySpend: monthlySpendResult._sum.estimatedCost || 0,
    });
  } catch (error) {
    console.error("GET /api/travel/stats error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
