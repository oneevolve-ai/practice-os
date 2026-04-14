import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const text = await file.text();
  const lines = text.split("\n").filter(Boolean);
  if (lines.length < 2) return NextResponse.json({ error: "Empty file" }, { status: 400 });

  const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim().toLowerCase().replace(/\s+/g, ""));
  const created: string[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      if (line[c] === '"') { inQuotes = !inQuotes; continue; }
      if (line[c] === "," && !inQuotes) { values.push(current.trim()); current = ""; continue; }
      current += line[c];
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ""; });

    const name = row["name"] || row["departmentname"] || row["department"] || "";
    const code = row["code"] || row["departmentcode"] || name.toUpperCase().replace(/\s+/g, "_").slice(0, 10);
    if (!name) { errors.push(`Row ${i}: skipped — missing name`); continue; }

    try {
      await prisma.department.upsert({
        where: { code },
        update: { name, description: row["description"] || null },
        create: { name, code, description: row["description"] || null },
      });
      created.push(name);
    } catch (e: any) {
      errors.push(`Row ${i} (${name}): ${e.message?.slice(0, 80)}`);
    }
  }

  return NextResponse.json({ created: created.length, errors });
}
