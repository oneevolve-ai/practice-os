import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INDIAN_HOLIDAYS_2026 = [
  { date: "2026-01-26", name: "Republic Day", type: "NATIONAL" },
  { date: "2026-03-10", name: "Maha Shivaratri", type: "RESTRICTED" },
  { date: "2026-03-17", name: "Holi", type: "NATIONAL" },
  { date: "2026-03-20", name: "Eid-ul-Fitr", type: "NATIONAL" },
  { date: "2026-03-30", name: "Ugadi / Gudi Padwa", type: "RESTRICTED" },
  { date: "2026-04-03", name: "Good Friday", type: "NATIONAL" },
  { date: "2026-04-14", name: "Dr. Ambedkar Jayanti", type: "NATIONAL" },
  { date: "2026-05-01", name: "May Day", type: "RESTRICTED" },
  { date: "2026-05-24", name: "Buddha Purnima", type: "NATIONAL" },
  { date: "2026-05-27", name: "Eid-ul-Adha", type: "NATIONAL" },
  { date: "2026-06-26", name: "Muharram", type: "NATIONAL" },
  { date: "2026-08-11", name: "Raksha Bandhan", type: "RESTRICTED" },
  { date: "2026-08-14", name: "Janmashtami", type: "NATIONAL" },
  { date: "2026-08-15", name: "Independence Day", type: "NATIONAL" },
  { date: "2026-08-25", name: "Milad-un-Nabi", type: "NATIONAL" },
  { date: "2026-10-02", name: "Gandhi Jayanti", type: "NATIONAL" },
  { date: "2026-10-02", name: "Dussehra", type: "NATIONAL" },
  { date: "2026-10-21", name: "Diwali", type: "NATIONAL" },
  { date: "2026-10-22", name: "Diwali (Day 2)", type: "NATIONAL" },
  { date: "2026-11-05", name: "Guru Nanak Jayanti", type: "NATIONAL" },
  { date: "2026-11-14", name: "Children's Day", type: "RESTRICTED" },
  { date: "2026-12-25", name: "Christmas", type: "NATIONAL" },
];

export async function POST(request: Request) {
  try {
    const body = await request.json?.() || {};
    const year = body.year || 2026;

    let created = 0;
    let skipped = 0;

    const holidays = year === 2026 ? INDIAN_HOLIDAYS_2026 : INDIAN_HOLIDAYS_2026.map((h) => ({
      ...h,
      date: h.date.replace("2026", String(year)),
    }));

    for (const h of holidays) {
      const date = new Date(h.date);
      try {
        await prisma.holiday.create({
          data: { date, name: h.name, type: h.type as "NATIONAL" | "RESTRICTED" | "COMPANY", year },
        });
        created++;
      } catch {
        skipped++; // duplicate
      }
    }

    return NextResponse.json({ created, skipped, total: holidays.length });
  } catch (error) {
    console.error("POST /api/holidays/seed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
