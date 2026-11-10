-- AlterTable
ALTER TABLE "UserSessions" ADD COLUMN     "smsToken" TEXT,
ALTER COLUMN "refreshToken" DROP NOT NULL,
ALTER COLUMN "resetToken" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
