import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_ALLOCATIONS: Record<string, number> = {
  CASUAL: 12, SICK: 12, EARNED: 15, COMP_OFF: 0, UNPAID: 0,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    if (!employeeId) return NextResponse.json({ error: "employeeId required" }, { status: 400 });

    const year = new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    // Get policies from DB
    const policies = await prisma.leavePolicy.findMany();
    const policyMap = new Map(policies.map((p) => [p.leaveType, p]));

    const approved = await prisma.leaveRequest.groupBy({
      by: ["leaveType"],
      where: {
        employeeId,
        status: "APPROVED",
        startDate: { gte: startOfYear, lte: endOfYear },
      },
      _sum: { days: true },
    });

    const leaveTypes = ["CASUAL", "SICK", "EARNED", "UNPAID", "COMP_OFF"];
    const balances = leaveTypes.map((type) => {
      const policy = policyMap.get(type);
      const allocation = policy ? policy.allocation : (DEFAULT_ALLOCATIONS[type] || 0);
      const isUnlimited = policy ? policy.isUnlimited : (type === "UNPAID");
      const used = approved.find((a) => a.leaveType === type)?._sum.days || 0;

      return {
        type,
        allocation: isUnlimited ? "Unlimited" : allocation,
        used,
        remaining: isUnlimited ? "N/A" : allocation - used,
        carryForward: policy?.carryForward || false,
        maxCarryDays: policy?.maxCarryDays || 0,
        minAdvanceDays: policy?.minAdvanceDays || 0,
        maxConsecutive: policy?.maxConsecutive || 0,
        isUnlimited,
      };
    });

    return NextResponse.json(balances);
  } catch (error) {
    console.error("GET /api/leave/balance error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
