-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ONLINE_PAYMENT', 'CASH_ON_DELIVERY');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "type" "PaymentMethod" NOT NULL DEFAULT 'CASH_ON_DELIVERY';
