-- CreateEnum
CREATE TYPE "ConventionType" AS ENUM ('AVAILABILITY', 'RESTRICTION', 'LEGAL', 'MEDICAL', 'CUSTOM');

-- CreateTable
CREATE TABLE "conventions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ConventionType" NOT NULL DEFAULT 'CUSTOM',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "conventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_conventions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conventionId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT,

    CONSTRAINT "user_conventions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_conventions_userId_idx" ON "user_conventions"("userId");

-- CreateIndex
CREATE INDEX "user_conventions_conventionId_idx" ON "user_conventions"("conventionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_conventions_userId_conventionId_key" ON "user_conventions"("userId", "conventionId");

-- AddForeignKey
ALTER TABLE "conventions" ADD CONSTRAINT "conventions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_conventions" ADD CONSTRAINT "user_conventions_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_conventions" ADD CONSTRAINT "user_conventions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_conventions" ADD CONSTRAINT "user_conventions_conventionId_fkey" FOREIGN KEY ("conventionId") REFERENCES "conventions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
