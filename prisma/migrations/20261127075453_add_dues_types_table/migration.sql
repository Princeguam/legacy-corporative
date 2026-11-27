-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'DUES';

-- DropForeignKey
ALTER TABLE "PaymentTransactions" DROP CONSTRAINT "PaymentTransactions_chargeId_fkey";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "joinCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "joinedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PaymentTransactions" ADD COLUMN     "duesTypeId" INTEGER;

-- CreateTable
CREATE TABLE "DueTypes" (
    "id" SERIAL NOT NULL,
    "createdById" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" BIGINT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DueTypes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DueTypes_name_key" ON "DueTypes"("name");

-- AddForeignKey
ALTER TABLE "PaymentTransactions" ADD CONSTRAINT "PaymentTransactions_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charges"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransactions" ADD CONSTRAINT "PaymentTransactions_duesTypeId_fkey" FOREIGN KEY ("duesTypeId") REFERENCES "DueTypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DueTypes" ADD CONSTRAINT "DueTypes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
