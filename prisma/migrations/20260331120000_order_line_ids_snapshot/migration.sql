-- AlterTable
ALTER TABLE "order_lines" ADD COLUMN "product_id" TEXT;
ALTER TABLE "order_lines" ADD COLUMN "custom_request_id" TEXT;
ALTER TABLE "order_lines" ADD COLUMN "snapshot_data" TEXT;
