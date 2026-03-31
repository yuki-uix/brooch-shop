-- AlterTable
ALTER TABLE "custom_requests" ADD COLUMN "evaluated_at" DATETIME;
ALTER TABLE "custom_requests" ADD COLUMN "feasibility" TEXT;
ALTER TABLE "custom_requests" ADD COLUMN "model" TEXT;
ALTER TABLE "custom_requests" ADD COLUMN "provider" TEXT;
ALTER TABLE "custom_requests" ADD COLUMN "quote_amount" INTEGER;
ALTER TABLE "custom_requests" ADD COLUMN "reason" TEXT;
