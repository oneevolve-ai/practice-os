import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const status = searchParams.get("status") || "";
    const projectRole = searchParams.get("projectRole") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { designation: { contains: search, mode: "insensitive" } },
      ];
    }
    if (department) where.departmentId = department;
    if (status) where.status = status;
    if (projectRole) where.projectRole = projectRole;

    const employees = await prisma.employee.findMany({
      where,
      include: { department: { select: { name: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("GET /api/employees error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const employee = await prisma.employee.create({
      data: {
        name: body.name,
        email: body.email,
        personalEmail: body.personalEmail || null,
        phone: body.phone || null,
        personalMobile: body.personalMobile || null,
        linkedin: body.linkedin || null,
        designation: body.designation || null,
        roleDescription: body.roleDescription || null,
        departmentId: body.departmentId || null,
        reportingOffice: body.reportingOffice || null,
        reportingManagerId: body.reportingManagerId || null,
        reportingManager: body.reportingManager || null,
        hrLead: body.hrLead || null,
        joiningDate: body.joiningDate ? new Date(body.joiningDate) : null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        resignationDate: body.resignationDate ? new Date(body.resignationDate) : null,
        status: body.status || "ACTIVE",
        exitType: body.exitType || null,
        yearsOfExperience: body.yearsOfExperience ? parseFloat(body.yearsOfExperience) : null,
        highestQualification: body.highestQualification || null,
        previousOrganisations: body.previousOrganisations || null,
        orientation: body.orientation || null,
        projectRole: body.projectRole || "OTHER",
        scopeExpertise: body.scopeExpertise || null,
        projectTypeExpertise: body.projectTypeExpertise || null,
        scopeStageExpertise: body.scopeStageExpertise || null,
        licenseNumbers: body.licenseNumbers || null,
        isPE: body.isPE || false,
        isRA: body.isRA || false,
        address: body.address || null,
        salaryBand: body.salaryBand || null,
        emergencyContact: body.emergencyContact || null,
        emergencyPhone: body.emergencyPhone || null,
        aadharNumber: body.aadharNumber || null,
        passportNumber: body.passportNumber || null,
      },
    });
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("POST /api/employees error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
