-- CreateEnum
CREATE TYPE "ModelType" AS ENUM ('CHAT', 'REASONING', 'EMBEDDING', 'IMAGE', 'AUDIO', 'CODE');
CREATE TYPE "Modality" AS ENUM ('TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'FILE');
CREATE TYPE "BenchmarkCategory" AS ENUM ('GENERAL', 'REASONING', 'CODING', 'MATH', 'MULTIMODAL');

-- CreateTable
CREATE TABLE "Lab" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "founded" INTEGER NOT NULL,
    "website" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "openWeights" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "labId" TEXT NOT NULL,
    "type" "ModelType" NOT NULL,
    "description" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "contextWindow" INTEGER NOT NULL,
    "maxOutput" INTEGER NOT NULL,
    "parameters" TEXT,
    "openWeights" BOOLEAN NOT NULL DEFAULT false,
    "inputModalities" "Modality"[],
    "outputModalities" "Modality"[],
    "capabilities" TEXT[],
    "inputPrice" DECIMAL(10,4),
    "outputPrice" DECIMAL(10,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProviderModel" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "inputPrice" DECIMAL(10,4),
    "outputPrice" DECIMAL(10,4),
    "latencyMs" INTEGER NOT NULL,
    "throughput" INTEGER NOT NULL,
    "uptime" DECIMAL(5,2) NOT NULL,
    CONSTRAINT "ProviderModel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Benchmark" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "BenchmarkCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "Benchmark_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BenchmarkScore" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "benchmarkId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "BenchmarkScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lab_slug_key" ON "Lab"("slug");
CREATE UNIQUE INDEX "Provider_slug_key" ON "Provider"("slug");
CREATE UNIQUE INDEX "Model_slug_key" ON "Model"("slug");
CREATE INDEX "Model_labId_idx" ON "Model"("labId");
CREATE INDEX "Model_type_idx" ON "Model"("type");
CREATE INDEX "Model_releaseDate_idx" ON "Model"("releaseDate");
CREATE INDEX "Model_inputPrice_idx" ON "Model"("inputPrice");
CREATE INDEX "Model_contextWindow_idx" ON "Model"("contextWindow");
CREATE INDEX "ProviderModel_providerId_idx" ON "ProviderModel"("providerId");
CREATE UNIQUE INDEX "ProviderModel_modelId_providerId_key" ON "ProviderModel"("modelId", "providerId");
CREATE UNIQUE INDEX "Benchmark_slug_key" ON "Benchmark"("slug");
CREATE INDEX "BenchmarkScore_benchmarkId_score_idx" ON "BenchmarkScore"("benchmarkId", "score");
CREATE UNIQUE INDEX "BenchmarkScore_modelId_benchmarkId_key" ON "BenchmarkScore"("modelId", "benchmarkId");

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProviderModel" ADD CONSTRAINT "ProviderModel_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProviderModel" ADD CONSTRAINT "ProviderModel_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BenchmarkScore" ADD CONSTRAINT "BenchmarkScore_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BenchmarkScore" ADD CONSTRAINT "BenchmarkScore_benchmarkId_fkey" FOREIGN KEY ("benchmarkId") REFERENCES "Benchmark"("id") ON DELETE CASCADE ON UPDATE CASCADE;
