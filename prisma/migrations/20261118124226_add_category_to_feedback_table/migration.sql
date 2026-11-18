/*
  Warnings:

  - Added the required column `category` to the `Feedbacks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Feedbacks" ADD COLUMN     "category" TEXT NOT NULL;
