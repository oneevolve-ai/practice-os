import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const KNOWN_STATUSES = ["proposal sent","meeting done","in loop","proposal done","shortlisted","won","lost","on hold","lead"];

function parseCSV(text: string) {
  const lines = text.split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim().toLowerCase().replace(/\s+/g, ""));
  const results = [];
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
    results.push(row);
  }
  return results;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const created: string[] = [];
  const errors: string[] = [];

  try {
    if (file.name.endsWith(".csv")) {
      const text = await file.text();
      const rows = parseCSV(text);
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const name = row["name"] || row["organisationname"] || "";
        if (!name) { errors.push(`Row ${i + 1}: skipped — missing name`); continue; }
        try {
          await prisma.client.create({
            data: {
              name, uin: row["uin"] || null, businessType: row["businesstype"] || null,
              businessScale: row["businessscale"] || null, engagementLevel: row["engagementlevel"] || null,
              established: row["established"] ? parseInt(row["established"]) || null : null,
              accountManager: row["accountmanager"] || null, industry: row["industry"] || null,
              website: row["website"] || null, linkedIn: row["linkedin"] || null,
              email: row["email"] || null, phone: row["phone"] || null,
              headquarters: row["headquarters"] || null, gstin: row["gstin"] || null,
              pan: row["pan"] || null, notes: row["notes"] || null, status: "PROSPECT",
            },
          });
          created.push(name);
        } catch (e: any) { errors.push(`Row ${i + 1} (${name}): ${e.message?.slice(0, 80)}`); }
      }
    } else if (file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
      const text = await file.text();
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      let i = 0;
      while (i < lines.length) {
        const line = lines[i];
        if (line.toLowerCase().includes("status of the following") ||
            line.toLowerCase() === "company" ||
            line.toLowerCase() === "status") { i++; continue; }
        const nextLine = lines[i + 1] || "";
        const isStatus = KNOWN_STATUSES.some(s => nextLine.toLowerCase().includes(s));
        if (isStatus && line.length > 2) {
          const name = line;
          const status = nextLine;
          const notesLines: string[] = [];
          let j = i + 2;
          while (j < lines.length && j < i + 7) {
            const futureLine = lines[j + 1] || "";
            const isFutureStatus = KNOWN_STATUSES.some(s => futureLine.toLowerCase().includes(s));
            if (isFutureStatus) break;
            notesLines.push(lines[j]);
            j++;
          }
          const notes = notesLines.join(" ").trim();
          try {
            const existing = await prisma.client.findFirst({ where: { name } });
            if (existing) {
              await prisma.client.update({ where: { id: existing.id }, data: { notes: notes || existing.notes, engagementLevel: status } });
              created.push(`${name} (updated)`);
            } else {
              await prisma.client.create({ data: { name, engagementLevel: status, notes, status: "PROSPECT" } });
              created.push(name);
            }
          } catch (e: any) { errors.push(`${name}: ${e.message?.slice(0, 80)}`); }
          i = j;
        } else { i++; }
      }
    } else {
      return NextResponse.json({ error: "Unsupported format. Use CSV or Word (.docx)" }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  return NextResponse.json({ created: created.length, errors });
}
