/*
  Warnings:

  - You are about to drop the `Transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_bankAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_userId_fkey";

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "fullName" TEXT;

-- DropTable
DROP TABLE "Transactions";

-- CreateTable
CREATE TABLE "PaymentTransactions" (
    "id" SERIAL NOT NULL,
    "bankAccountId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "type" "TransactionType" NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "note" TEXT,
    "attachmentUrl" TEXT,
    "reviewedById" INTEGER,
    "depositedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentTransactions" ADD CONSTRAINT "PaymentTransactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransactions" ADD CONSTRAINT "PaymentTransactions_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "Users"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransactions" ADD CONSTRAINT "PaymentTransactions_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAcconts"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
