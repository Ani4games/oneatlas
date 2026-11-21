import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";

interface Params { benchmark?: string; category?: Prisma.BenchmarkWhereInput["category"]; type?: string; limit: number }

export async function getRankings({ benchmark, category, type, limit }: Params) {
  const benchmarks = await prisma.benchmark.findMany({ orderBy: { name: "asc" } });
  let selected = benchmarks;
  if (benchmark) {
    selected = benchmarks.filter((b) => b.slug === benchmark);
    if (!selected.length) throw new NotFoundError("Benchmark");
  } else if (category) {
    selected = benchmarks.filter((b) => b.category === category);
  }

  const scores = await prisma.benchmarkScore.findMany({
    where: { benchmarkId: { in: selected.map((b) => b.id) }, ...(type ? { model: { type: type as never } } : {}) },
    include: { model: { include: { lab: { select: { slug: true, name: true } } } } },
  });

  const byModel = new Map<string, { model: (typeof scores)[number]["model"]; scores: Record<string, number> }>();
  for (const s of scores) {
    const slug = benchmarks.find((b) => b.id === s.benchmarkId)!.slug;
    const e = byModel.get(s.modelId) ?? { model: s.model, scores: {} };
    e.scores[slug] = s.score;
    byModel.set(s.modelId, e);
  }

  // A single benchmark ranks by that score; multiple benchmarks rank by mean of available scores,
  // requiring a model to have at least half of the selected benchmarks to avoid skew.
  const minCovered = selected.length === 1 ? 1 : Math.ceil(selected.length / 2);
  const entries = [...byModel.values()]
    .filter((e) => Object.keys(e.scores).length >= minCovered)
    .map((e) => {
      const vals = Object.values(e.scores);
      return {
        model: { slug: e.model.slug, name: e.model.name, type: e.model.type, lab: e.model.lab, openWeights: e.model.openWeights, inputPrice: e.model.inputPrice == null ? null : Number(e.model.inputPrice) },
        score: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
        scores: e.scores,
      };
    })
    .sort((a, b) => b.score - a.score || a.model.name.localeCompare(b.model.name))
    .slice(0, limit)
    .map((e, i) => ({ rank: i + 1, ...e }));

  return {
    scope: benchmark ? { kind: "benchmark" as const, slug: benchmark } : category ? { kind: "category" as const, slug: category } : { kind: "overall" as const },
    benchmarks: benchmarks.map((b) => ({ slug: b.slug, name: b.name, category: b.category, description: b.description })),
    columns: selected.map((b) => ({ slug: b.slug, name: b.name })),
    entries,
  };
}
export type Rankings = Awaited<ReturnType<typeof getRankings>>;
