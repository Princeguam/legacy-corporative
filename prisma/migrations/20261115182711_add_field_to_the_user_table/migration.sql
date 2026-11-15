-- AlterTable
ALTER TABLE "PaymentTransactions" ALTER COLUMN "type" SET DEFAULT 'DEPOSIT';

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
