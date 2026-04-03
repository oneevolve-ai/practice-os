import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employees } = body;

    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return NextResponse.json({ error: "No employee data provided" }, { status: 400 });
    }

    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const emp of employees) {
      try {
        if (!emp.name || !emp.email) {
          errors.push(`Row skipped: missing name or email (${emp.name || emp.email || "unknown"})`);
          failed++;
          continue;
        }

        await prisma.employee.create({
          data: {
            name: emp.name?.trim(),
            email: emp.email?.trim().toLowerCase(),
            personalEmail: emp.personalEmail?.trim() || null,
            phone: emp.phone?.trim() || null,
            personalMobile: emp.personalMobile?.trim() || null,
            linkedin: emp.linkedin?.trim() || null,
            designation: emp.designation?.trim() || null,
            roleDescription: emp.roleDescription?.trim() || null,
            departmentId: emp.departmentId || null,
            reportingOffice: emp.reportingOffice?.trim() || null,
            reportingManager: emp.reportingManager?.trim() || null,
            hrLead: emp.hrLead?.trim() || null,
            joiningDate: emp.joiningDate ? new Date(emp.joiningDate) : null,
            dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth) : null,
            status: emp.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
            yearsOfExperience: emp.yearsOfExperience ? parseFloat(emp.yearsOfExperience) : null,
            highestQualification: emp.highestQualification?.trim() || null,
            previousOrganisations: emp.previousOrganisations?.trim() || null,
            orientation: emp.orientation?.trim() || null,
            projectRole: ["ARCHITECT", "ENGINEER", "CONSULTANT", "PROJECT_MANAGER", "DESIGNER"].includes(emp.projectRole?.toUpperCase()) ? emp.projectRole.toUpperCase() : "OTHER",
            scopeExpertise: emp.scopeExpertise?.trim() || null,
            projectTypeExpertise: emp.projectTypeExpertise?.trim() || null,
            scopeStageExpertise: emp.scopeStageExpertise?.trim() || null,
            licenseNumbers: emp.licenseNumbers?.trim() || null,
            isPE: emp.isPE === true || emp.isPE === "true" || emp.isPE === "yes" || emp.isPE === "Yes",
            isRA: emp.isRA === true || emp.isRA === "true" || emp.isRA === "yes" || emp.isRA === "Yes",
            address: emp.address?.trim() || null,
            salaryBand: emp.salaryBand?.trim() || null,
            emergencyContact: emp.emergencyContact?.trim() || null,
            emergencyPhone: emp.emergencyPhone?.trim() || null,
            aadharNumber: emp.aadharNumber?.trim() || null,
            passportNumber: emp.passportNumber?.trim() || null,
          },
        });
        created++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Unique constraint")) {
          errors.push(`${emp.name} (${emp.email}): Email already exists`);
        } else {
          errors.push(`${emp.name}: ${msg.slice(0, 100)}`);
        }
        failed++;
      }
    }

    return NextResponse.json({ created, failed, total: employees.length, errors });
  } catch (error) {
    console.error("POST /api/employees/bulk error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
