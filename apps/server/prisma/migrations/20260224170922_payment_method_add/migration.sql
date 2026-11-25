-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "type" "PaymentMethod" NOT NULL DEFAULT 'CASH_ON_DELIVERY';
