import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        documents: { orderBy: { uploadedAt: "desc" } },
      },
    });
    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Get reportees (employees who have this person as reporting manager)
    const directReportees = await prisma.employee.findMany({
      where: { reportingManagerId: id },
      select: { id: true, name: true, designation: true },
    });

    return NextResponse.json({ ...employee, directReportees });
  } catch (error) {
    console.error("GET employee error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};

    const stringFields = [
      "name", "email", "personalEmail", "phone", "personalMobile", "linkedin",
      "designation", "roleDescription", "reportingOffice", "reportingManagerId",
      "reportingManager", "hrLead", "status", "orientation",
      "highestQualification", "previousOrganisations", "projectRole",
      "scopeExpertise", "projectTypeExpertise", "scopeStageExpertise",
      "licenseNumbers", "address", "salaryBand", "emergencyContact",
      "emergencyPhone", "aadharNumber", "passportNumber", "exitType",
    ];

    for (const field of stringFields) {
      if (body[field] !== undefined) {
        data[field] = body[field] || null;
      }
    }

    if (body.departmentId !== undefined) data.departmentId = body.departmentId || null;
    if (body.joiningDate !== undefined) data.joiningDate = body.joiningDate ? new Date(body.joiningDate) : null;
    if (body.dateOfBirth !== undefined) data.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    if (body.resignationDate !== undefined) data.resignationDate = body.resignationDate ? new Date(body.resignationDate) : null;
    if (body.yearsOfExperience !== undefined) data.yearsOfExperience = body.yearsOfExperience ? parseFloat(body.yearsOfExperience) : null;
    if (body.isPE !== undefined) data.isPE = body.isPE;
    if (body.isRA !== undefined) data.isRA = body.isRA;
    if (body.status !== undefined) data.status = body.status;

    const updated = await prisma.employee.update({
      where: { id },
      data,
      include: { department: true, documents: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH employee error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE employee error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
