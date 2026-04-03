import { NextResponse } from "next/server";

export async function GET() {
  const headers = [
    "name", "email", "personalEmail", "phone", "personalMobile", "linkedin",
    "designation", "roleDescription", "reportingOffice", "reportingManager",
    "hrLead", "status", "joiningDate", "dateOfBirth",
    "yearsOfExperience", "highestQualification", "previousOrganisations",
    "orientation", "projectRole", "scopeExpertise", "projectTypeExpertise",
    "scopeStageExpertise", "licenseNumbers", "isPE", "isRA",
    "address", "salaryBand", "emergencyContact", "emergencyPhone",
    "aadharNumber", "passportNumber",
  ];

  const sampleRow = [
    "John Doe", "john@oneevolve.ai", "john.personal@gmail.com", "+91-9876543210", "+91-9876543211",
    "https://linkedin.com/in/johndoe", "Senior Architect", "Lead design projects",
    "Mumbai HQ", "Jane Smith", "HR Lead Name", "ACTIVE", "2024-01-15", "1990-05-20",
    "8", "M.Arch", "Firm A; Firm B", "Design",
    "ARCHITECT", "Structural", "Commercial", "Concept; DD; CD",
    "PE-12345", "true", "false",
    "123 Main St, Mumbai", "L5", "Parent Name", "+91-9876543212",
    "1234 5678 9012", "A1234567",
  ];

  const csv = [headers.join(","), sampleRow.join(",")].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="employee-bulk-upload-template.csv"',
    },
  });
}
