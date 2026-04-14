-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "closeDate" TIMESTAMP(3),
ADD COLUMN     "probability" INTEGER;

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "closeDate" TIMESTAMP(3),
ADD COLUMN     "probability" INTEGER;
