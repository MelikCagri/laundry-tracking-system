-- AlterTable
ALTER TABLE "Queue" ADD COLUMN     "notifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pushSubscription" JSONB;
