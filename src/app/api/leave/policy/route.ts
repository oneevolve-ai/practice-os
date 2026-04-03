import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULTS = [
  { leaveType: "CASUAL", allocation: 12, carryForward: false, maxCarryDays: 0, minAdvanceDays: 1, maxConsecutive: 3, isUnlimited: false },
  { leaveType: "SICK", allocation: 12, carryForward: false, maxCarryDays: 0, minAdvanceDays: 0, maxConsecutive: 7, isUnlimited: false },
  { leaveType: "EARNED", allocation: 15, carryForward: true, maxCarryDays: 10, minAdvanceDays: 7, maxConsecutive: 15, isUnlimited: false },
  { leaveType: "UNPAID", allocation: 0, carryForward: false, maxCarryDays: 0, minAdvanceDays: 3, maxConsecutive: 30, isUnlimited: true },
  { leaveType: "COMP_OFF", allocation: 0, carryForward: false, maxCarryDays: 0, minAdvanceDays: 0, maxConsecutive: 0, isUnlimited: false },
];

export async function GET() {
  try {
    let policies = await prisma.leavePolicy.findMany({ orderBy: { leaveType: "asc" } });
    if (policies.length === 0) {
      // Seed defaults
      for (const d of DEFAULTS) {
        await prisma.leavePolicy.create({ data: d as Record<string, unknown> });
      }
      policies = await prisma.leavePolicy.findMany({ orderBy: { leaveType: "asc" } });
    }
    return NextResponse.json(policies);
  } catch (error) {
    console.error("GET /api/leave/policy error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { policies } = body;

    for (const p of policies) {
      await prisma.leavePolicy.upsert({
        where: { leaveType: p.leaveType },
        update: {
          allocation: parseInt(p.allocation),
          carryForward: p.carryForward || false,
          maxCarryDays: parseInt(p.maxCarryDays) || 0,
          minAdvanceDays: parseInt(p.minAdvanceDays) || 0,
          maxConsecutive: parseInt(p.maxConsecutive) || 0,
          isUnlimited: p.isUnlimited || false,
        },
        create: {
          leaveType: p.leaveType,
          allocation: parseInt(p.allocation),
          carryForward: p.carryForward || false,
          maxCarryDays: parseInt(p.maxCarryDays) || 0,
          minAdvanceDays: parseInt(p.minAdvanceDays) || 0,
          maxConsecutive: parseInt(p.maxConsecutive) || 0,
          isUnlimited: p.isUnlimited || false,
        },
      });
    }

    const updated = await prisma.leavePolicy.findMany({ orderBy: { leaveType: "asc" } });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/leave/policy error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
