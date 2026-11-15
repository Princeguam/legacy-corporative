/*
  Warnings:

  - Added the required column `source` to the `PaymentTransactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('Admin', 'User');

-- AlterTable
ALTER TABLE "PaymentTransactions" ADD COLUMN     "source" "TransactionSource" NOT NULL;
