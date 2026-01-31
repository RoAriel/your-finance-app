/*
  Warnings:

  - You are about to drop the column `savingsAccountId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `savings_accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('WALLET', 'SAVINGS', 'INVESTMENT', 'CREDIT_CARD');

-- DropForeignKey
ALTER TABLE "savings_accounts" DROP CONSTRAINT "savings_accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_savingsAccountId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "savingsAccountId",
ADD COLUMN     "account_id" TEXT;

-- DropTable
DROP TABLE "savings_accounts";

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL DEFAULT 'WALLET',
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "color" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'wallet',
    "targetAmount" DECIMAL(10,2),
    "targetDate" TIMESTAMP(3),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
