-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'REFERRAL', 'PAID_ADS', 'ORGANIC', 'OTHER');

-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyCnpj" TEXT NOT NULL,
    "companyWebsite" TEXT,
    "estimatedValue" DOUBLE PRECISION,
    "source" "LeadSource" NOT NULL,
    "notes" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrichment_history" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "payload" JSONB,
    "status" "ProcessStatus" NOT NULL,
    "errorMessage" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "enrichment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classification_history" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "classification" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "commercialPotential" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "status" "ProcessStatus" NOT NULL,
    "errorMessage" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "classification_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leads_email_key" ON "leads"("email");

-- CreateIndex
CREATE UNIQUE INDEX "leads_companyCnpj_key" ON "leads"("companyCnpj");

-- AddForeignKey
ALTER TABLE "enrichment_history" ADD CONSTRAINT "enrichment_history_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classification_history" ADD CONSTRAINT "classification_history_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
