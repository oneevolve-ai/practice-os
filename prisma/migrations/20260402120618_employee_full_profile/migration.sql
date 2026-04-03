-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('PHOTO', 'CV', 'EXPERIENCE_DOC', 'EDUCATIONAL_DOC', 'EXIT_DOC', 'ID_DOC', 'OTHER');

-- CreateEnum
CREATE TYPE "ExitType" AS ENUM ('RESIGNATION', 'TERMINATION', 'RETIREMENT', 'CONTRACT_END', 'OTHER');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "aadharNumber" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "exitType" "ExitType",
ADD COLUMN     "highestQualification" TEXT,
ADD COLUMN     "hrLead" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "orientation" TEXT,
ADD COLUMN     "passportNumber" TEXT,
ADD COLUMN     "personalEmail" TEXT,
ADD COLUMN     "personalMobile" TEXT,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "previousOrganisations" TEXT,
ADD COLUMN     "projectTypeExpertise" TEXT,
ADD COLUMN     "reportingManagerId" TEXT,
ADD COLUMN     "reportingOffice" TEXT,
ADD COLUMN     "resignationDate" TIMESTAMP(3),
ADD COLUMN     "roleDescription" TEXT,
ADD COLUMN     "scopeExpertise" TEXT,
ADD COLUMN     "scopeStageExpertise" TEXT,
ADD COLUMN     "yearsOfExperience" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "EmployeeDocument" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "docType" "DocType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
