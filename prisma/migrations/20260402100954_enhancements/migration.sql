-- CreateEnum
CREATE TYPE "TravelMode" AS ENUM ('FLIGHT', 'TRAIN', 'BUS', 'CAR', 'OTHER');

-- AlterTable
ALTER TABLE "TravelRequest" ADD COLUMN     "departureTime" TEXT,
ADD COLUMN     "originCity" TEXT,
ADD COLUMN     "returnTime" TEXT,
ADD COLUMN     "selectedOffer" JSONB,
ADD COLUMN     "travelMode" "TravelMode" NOT NULL DEFAULT 'FLIGHT';

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fromStatus" "TravelStatus",
    "toStatus" "TravelStatus" NOT NULL,
    "comment" TEXT,
    "changedBy" TEXT NOT NULL DEFAULT 'System',
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TravelRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TravelRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
