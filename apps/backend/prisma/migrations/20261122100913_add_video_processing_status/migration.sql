-- CreateEnum
CREATE TYPE "videoStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "status" "videoStatus" NOT NULL DEFAULT 'PENDING';
