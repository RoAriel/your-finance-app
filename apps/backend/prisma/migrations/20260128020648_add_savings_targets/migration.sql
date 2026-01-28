-- AlterTable
ALTER TABLE "savings_accounts" ADD COLUMN     "icon" TEXT NOT NULL DEFAULT 'wallet',
ADD COLUMN     "targetAmount" DECIMAL(10,2),
ADD COLUMN     "targetDate" TIMESTAMP(3);
