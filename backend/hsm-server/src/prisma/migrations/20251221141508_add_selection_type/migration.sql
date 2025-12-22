-- CreateEnum
CREATE TYPE "SelectionType" AS ENUM ('ADMIN_ASSIGNED', 'USER_SELECTED');

-- AlterTable
ALTER TABLE "user_conventions" ADD COLUMN     "selectionType" "SelectionType" NOT NULL DEFAULT 'USER_SELECTED';

-- CreateIndex
CREATE INDEX "user_conventions_selectionType_idx" ON "user_conventions"("selectionType");
