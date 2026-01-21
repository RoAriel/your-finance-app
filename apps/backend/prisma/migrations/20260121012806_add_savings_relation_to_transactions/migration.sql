-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "savingsAccountId" TEXT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_savingsAccountId_fkey" FOREIGN KEY ("savingsAccountId") REFERENCES "savings_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
