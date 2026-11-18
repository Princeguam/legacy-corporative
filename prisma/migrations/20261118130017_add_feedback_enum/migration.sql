/*
  Warnings:

  - Changed the type of `category` on the `Feedbacks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('General', 'Bug', 'Suggestion');

-- AlterTable
ALTER TABLE "Feedbacks" DROP COLUMN "category",
ADD COLUMN     "category" "FeedbackCategory" NOT NULL;
