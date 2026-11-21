import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { labs, providers, benchmarks, models } from "./data";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// Deterministic pseudo-random in [0,1) so reseeding is reproducible.
function rand(key: string) {
  let h = 2166136261;
  for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

const SPEED: Record<string, { lat: number; tps: number }> = {
  groq: { lat: 180, tps: 480 }, "fireworks-ai": { lat: 320, tps: 190 }, "together-ai": { lat: 380, tps: 140 },
  deepinfra: { lat: 520, tps: 85 }, "aws-bedrock": { lat: 600, tps: 75 }, "azure-ai": { lat: 540, tps: 80 },
  "google-vertex": { lat: 450, tps: 120 }, "openai-api": { lat: 480, tps: 100 }, "anthropic-api": { lat: 520, tps: 70 },
  "mistral-la-plateforme": { lat: 400, tps: 95 }, "deepseek-api": { lat: 900, tps: 45 }, "xai-api": { lat: 700, tps: 65 },
};

async function main() {
  await prisma.benchmarkScore.deleteMany();
  await prisma.providerModel.deleteMany();
  await prisma.model.deleteMany();
  await prisma.benchmark.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.lab.deleteMany();

  const labIds: Record<string, string> = {};
  for (const l of labs) labIds[l.slug] = (await prisma.lab.create({ data: l })).id;

  const provIds: Record<string, string> = {};
  for (const p of providers) provIds[p.slug] = (await prisma.provider.create({ data: p })).id;

  const benchIds: string[] = [];
  for (const b of benchmarks) benchIds.push((await prisma.benchmark.create({ data: { ...b, category: b.category } })).id);

  for (const m of models) {
    const created = await prisma.model.create({
      data: {
        slug: m.slug, name: m.name, labId: labIds[m.lab], type: m.type, description: m.desc,
        releaseDate: new Date(m.release), contextWindow: m.ctx, maxOutput: m.out, parameters: m.params ?? null,
        openWeights: m.open, inputModalities: m.inM, outputModalities: m.outM, capabilities: m.caps,
        inputPrice: m.inP || null, outputPrice: m.outP || null,
      },
    });

    for (const [i, slug] of m.hosts.entries()) {
      const firstParty = i === 0;
      const factor = firstParty || !m.open ? 1 : 0.8 + rand(m.slug + slug) * 0.5;
      const s = SPEED[slug] ?? { lat: 500, tps: 90 };
      await prisma.providerModel.create({
        data: {
          modelId: created.id, providerId: provIds[slug],
          inputPrice: m.inP ? +(m.inP * factor).toFixed(4) : null, outputPrice: m.outP ? +(m.outP * factor).toFixed(4) : null,
          latencyMs: Math.round(s.lat * (0.85 + rand(slug + m.slug + "l") * 0.4)),
          throughput: Math.round(s.tps * (0.8 + rand(slug + m.slug + "t") * 0.4)),
          uptime: +(99 + rand(slug + m.slug + "u") * 0.99).toFixed(2),
        },
      });
    }

    for (const [i, score] of m.scores.entries()) {
      if (score == null) continue;
      await prisma.benchmarkScore.create({ data: { modelId: created.id, benchmarkId: benchIds[i], score } });
    }
  }

  console.log(`Seeded ${labs.length} labs, ${providers.length} providers, ${models.length} models, ${benchmarks.length} benchmarks`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
