-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('Deposit_Approved', 'Deposit_Rejected', 'Dues', 'Fine', 'General');

-- CreateEnum
CREATE TYPE "ChargeReason" AS ENUM ('MISSED_MEETING', 'LATE_DUES', 'OTHER');

-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('Active', 'Waived');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('Present', 'Absent', 'Excused');

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'FINE_PAYMENT';

-- AlterTable
ALTER TABLE "PaymentTransactions" ADD COLUMN     "chargeId" INTEGER;

-- CreateTable
CREATE TABLE "Notifications" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "readAt" TIMESTAMP(3),
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedbacks" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "response" TEXT,
    "respondedBy" TEXT,
    "responded" TIMESTAMP(3),
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Charges" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "reason" "ChargeReason" NOT NULL,
    "status" "ChargeStatus" NOT NULL DEFAULT 'Active',
    "amount" BIGINT NOT NULL,
    "description" TEXT,
    "period" DATE,
    "meetingId" INTEGER,
    "issuedBy" INTEGER NOT NULL,
    "waivedBy" TEXT,
    "waivedAt" TIMESTAMP(3),
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meetings" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "meetingUrl" TEXT NOT NULL,
    "heldAt" TIMESTAMP(3) NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "meetingId" INTEGER NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "userId" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notifications_userId_readAt_created_idx" ON "Notifications"("userId", "readAt", "created");

-- CreateIndex
CREATE INDEX "Feedbacks_userId_idx" ON "Feedbacks"("userId");

-- CreateIndex
CREATE INDEX "Charges_userId_status_idx" ON "Charges"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Charges_userId_reason_meetingId_key" ON "Charges"("userId", "reason", "meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "Charges_userId_reason_period_key" ON "Charges"("userId", "reason", "period");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_meetingId_userId_key" ON "Attendance"("meetingId", "userId");

-- AddForeignKey
ALTER TABLE "PaymentTransactions" ADD CONSTRAINT "PaymentTransactions_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedbacks" ADD CONSTRAINT "Feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charges" ADD CONSTRAINT "Charges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meetings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
