-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "emergencyContactRelationship" TEXT,
ADD COLUMN     "nextOfKinName" TEXT,
ADD COLUMN     "nextOfKinPhone" TEXT,
ADD COLUMN     "nextOfKinRelationship" TEXT,
ADD COLUMN     "occupation" TEXT,
ALTER COLUMN "address" DROP NOT NULL;
