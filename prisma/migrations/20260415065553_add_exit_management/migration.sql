-- CreateTable
CREATE TABLE "ExitManagement" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "resignationDate" TIMESTAMP(3) NOT NULL,
    "lastWorkingDay" TIMESTAMP(3) NOT NULL,
    "noticePeriod" INTEGER NOT NULL DEFAULT 60,
    "reason" TEXT,
    "exitType" TEXT NOT NULL DEFAULT 'RESIGNATION',
    "status" TEXT NOT NULL DEFAULT 'NOTICE_PERIOD',
    "interviewDone" BOOLEAN NOT NULL DEFAULT false,
    "interviewNotes" TEXT,
    "clearance" JSONB NOT NULL DEFAULT '{}',
    "fnfAmount" DOUBLE PRECISION,
    "fnfStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExitManagement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExitManagement_employeeId_key" ON "ExitManagement"("employeeId");

-- AddForeignKey
ALTER TABLE "ExitManagement" ADD CONSTRAINT "ExitManagement_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
