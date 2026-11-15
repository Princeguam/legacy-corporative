/*
  Warnings:

  - Added the required column `period` to the `PaymentTransactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentTransactions" ADD COLUMN     "period" TIMESTAMP(3) NOT NULL;
