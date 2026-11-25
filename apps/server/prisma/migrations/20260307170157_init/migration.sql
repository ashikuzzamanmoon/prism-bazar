-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'Bangladesh',
ADD COLUMN     "coveragePicture" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "thana" TEXT,
ADD COLUMN     "totalOrders" INTEGER NOT NULL DEFAULT 0;
