
ALTER TABLE "public"."order_payments"
ADD COLUMN "productSnapshots" JSONB,
ADD COLUMN "userId" TEXT;

UPDATE "public"."order_payments"
SET "productSnapshots" = '[]'::jsonb
WHERE "productSnapshots" IS NULL;

UPDATE "public"."order_payments"
SET "userId" = 'N/A'
WHERE "userId" IS NULL;

ALTER TABLE "public"."order_payments"
ALTER COLUMN "productSnapshots" SET NOT NULL,
ALTER COLUMN "productSnapshots" SET DEFAULT '[]'::jsonb,
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "userId" SET DEFAULT 'N/A';
