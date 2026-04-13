import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const text = await file.text();
  const lines = text.split("\n").filter(Boolean);
  if (lines.length < 2) return NextResponse.json({ error: "Empty file" }, { status: 400 });

  const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim().toLowerCase());
  const created: string[] = [];
  const errors: string[] = [];

  const parseDate = (d: string) => {
    if (!d) return null;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

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

    const name = row["name"];
    if (!name) { errors.push(`Row ${i}: skipped — missing name`); continue; }

    const emailVal = row["email"] || `noemail_${i}_${Date.now()}@placeholder.com`;

    try {
      const data = {
        name,
        email: emailVal,
        personalEmail: row["personalemail"] || null,
        phone: row["phone"] || row["personalmobile"] || null,
        personalMobile: row["personalmobile"] || null,
        linkedin: row["linkedin"] || null,
        designation: row["designation"] || null,
        roleDescription: row["roledescription"] || null,
        reportingOffice: row["reportingoffice"] || null,
        reportingManager: row["reportingmanager"] || null,
        hrLead: row["hrlead"] || null,
        status: (["ACTIVE","INACTIVE","ON_LEAVE","OFFBOARDED"].includes(row["status"]) ? row["status"] : "ACTIVE") as any,
        joiningDate: parseDate(row["joiningdate"]),
        dateOfBirth: parseDate(row["dateofbirth"]),
        yearsOfExperience: row["yearsofexperience"] ? parseFloat(row["yearsofexperience"]) || null : null,
        highestQualification: row["highestqualification"] || null,
        previousOrganisations: row["previousorganisations"] || null,
        orientation: row["orientation"] || null,
        projectRole: (row["projectrole"] || "OTHER") as any,
        scopeExpertise: row["scopeexpertise"] || null,
        projectTypeExpertise: row["projecttypeexpertise"] || null,
        scopeStageExpertise: row["scopestageexpertise"] || null,
        licenseNumbers: row["licensenumbers"] || null,
        isPE: row["ispe"] === "1" || row["ispe"]?.toLowerCase() === "true",
        isRA: row["isra"] === "1" || row["isra"]?.toLowerCase() === "true",
        address: row["address"] || null,
        salaryBand: row["salaryband"] || null,
        emergencyContact: row["emergencycontact"] || null,
        emergencyPhone: row["emergencyphone"] || null,
        aadharNumber: row["aadharnumber"] || null,
        passportNumber: row["passportnumber"] || null,
      };

      await prisma.employee.upsert({
        where: { email: emailVal },
        update: data,
        create: data,
      });
      created.push(name);
    } catch (e: any) {
      errors.push(`Row ${i} (${name}): ${e.message?.slice(0, 100)}`);
    }
  }

  return NextResponse.json({ created: created.length, errors });
}
