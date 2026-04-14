import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DESIGNATION_TO_DEPT: Record<string, string> = {
  // Leadership
  "md": "MGMT", "ceo": "MGMT", "coo": "MGMT", "director": "MGMT", "associate director": "MGMT",
  // Architecture
  "jr. architect": "ARC", "sr architech": "ARC", "design head": "ARC", "soubhagya thevar": "ARC",
  "design leader- (ff) & mep design": "ARC",
  // BIM
  "bim engineer": "BIM",
  // MEP
  "mep design engineer": "MEP", "project leader- mep design": "MEP", "mep tender head": "MEP",
  "mep draughtsman": "MEP",
  // Electrical
  "electrical design engineer": "ELE", "electrical draughtsman": "ELE",
  "electrical tender design engineer": "ELE", "electrical tender engineer": "ELE",
  "sr. engineer (electrical)": "ELE", "sr. draftsman (electrical)": "ELE",
  "sr.engineer - electrical": "ELE", "modeller/draftman (electrical)": "ELE",
  "modeller/draftsman (electrical)": "ELE",
  // HVAC
  "hvac design engineer": "HVAC", "hvac draughtsman": "HVAC",
  // Plumbing & Firefighting
  "plumbing design engineer": "PLB", "plumbing draughtsman": "PLB",
  "sr. plumbing draftsman": "PLB", "phe tender head": "PLB",
  "sr. draftsman (plumbing & fire fighting)": "PLB",
  "sr. engineer (plumbing and firefighting)": "PLB",
  "fire fighting engineer": "PLB", "fire fighting draughtsman": "PLB",
  "sr. draftsman (plumbing & firefighting)": "PLB",
  "sr. engineer (plumbing & firefighting)": "PLB",
  "draftsman (plumbing & firefighting)": "PLB",
  "modeller/draftsman (plumbing & firefighting)": "PLB",
  "sr. draftsman (plumbing and fire fighting)": "PLB",
  // ELV
  "elv design engineer": "ELV", "elv draughtsman": "ELV",
  // Tendering
  "tender": "TEND", "tendering & operation manager": "TEND",
  "tender planning execuitve": "TEND", "tender plumbing engineer": "TEND",
  "mep tender head": "TEND", "planning & tender execuitve": "TEND",
  "electrical tender design engineer": "TEND",
  // Project Management
  "reginal manager project": "PM", "project": "PM",
  // Finance
  "accountant": "FIN", "sr accountant": "FIN", "jr accountant": "FIN",
  "jr accpuntant": "FIN", "jr accountant": "FIN",
  "sr. account execuitve": "FIN", "komal sharma": "FIN",
  "jr accoutant": "FIN", "jr engineer": "FIN",
  // HR & Admin
  "hr manager": "HR", "hr executive": "HR", "admin manager": "HR",
  "executive administrator": "HR", "tendering & operation manager": "HR",
  // Site
  "mep site engineer": "SITE",
  // Support
  "driver": "SUP", "office boy": "SUP", "office asst": "SUP",
  // Training
  "trainee (mechanical engineer)": "TRAIN",
  "trainee modeller/draftsman (mechanical)": "TRAIN",
};

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

  const text = await file.text();
  const rows = parseCSV(text);
  const created: string[] = [];
  const errors: string[] = [];

  // Load all departments for matching
  const allDepts = await prisma.department.findMany();
  const deptByCode = new Map(allDepts.map(d => [d.code, d.id]));

  const parseDate = (d: string) => {
    if (!d) return null;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row["name"];
    if (!name) { errors.push(`Row ${i + 1}: skipped — missing name`); continue; }

    // Auto-assign department from designation
    const designation = (row["designation"] || "").toLowerCase().trim();
    const deptCode = DESIGNATION_TO_DEPT[designation];
    const departmentId = deptCode ? deptByCode.get(deptCode) || null : null;

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
        departmentId,
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
      errors.push(`Row ${i + 1} (${name}): ${e.message?.slice(0, 100)}`);
    }
  }

  return NextResponse.json({ created: created.length, errors });
}
