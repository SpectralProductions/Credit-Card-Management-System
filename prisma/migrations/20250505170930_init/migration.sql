/*
  Warnings:

  - You are about to drop the column `activationDate` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `generatedAt` on the `Statement` table. All the data in the column will be lost.
  - You are about to drop the `Dispute` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cardId]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cardholderName` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cvv` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiryMonth` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiryYear` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Redemption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Statement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_userId_fkey";

-- DropForeignKey
ALTER TABLE "Dispute" DROP CONSTRAINT "Dispute_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_cardId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Redemption" DROP CONSTRAINT "Redemption_rewardId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_cardId_fkey";

-- DropForeignKey
ALTER TABLE "Statement" DROP CONSTRAINT "Statement_cardId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_cardId_fkey";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "activationDate",
DROP COLUMN "expiryDate",
DROP COLUMN "status",
ADD COLUMN     "cardholderName" TEXT NOT NULL,
ADD COLUMN     "cvv" TEXT NOT NULL,
ADD COLUMN     "expiryMonth" INTEGER NOT NULL,
ADD COLUMN     "expiryYear" INTEGER NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Redemption" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Statement" DROP COLUMN "generatedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- DropTable
DROP TABLE "Dispute";

-- DropEnum
DROP TYPE "CardStatus";

-- DropEnum
DROP TYPE "DisputeStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Reward_cardId_key" ON "Reward"("cardId");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redemption" ADD CONSTRAINT "Redemption_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
