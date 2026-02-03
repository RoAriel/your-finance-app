/*
  Warnings:

  - A unique constraint covering the columns `[user_id,name,type,parent_id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "categories_user_id_name_type_key";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "parent_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "categories_user_id_name_type_parent_id_key" ON "categories"("user_id", "name", "type", "parent_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
