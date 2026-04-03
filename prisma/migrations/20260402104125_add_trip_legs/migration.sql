-- CreateTable
CREATE TABLE "TripLeg" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "legOrder" INTEGER NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "departureTime" TEXT,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "arrivalTime" TEXT,
    "travelMode" "TravelMode" NOT NULL DEFAULT 'FLIGHT',
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "TripLeg_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TripLeg" ADD CONSTRAINT "TripLeg_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TravelRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
