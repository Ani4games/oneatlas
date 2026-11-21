import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import type { ModelQuery } from "@/lib/validation";

const num = (d: { toString(): string } | number | null) => (d == null ? null : Number(d.toString()));

const listInclude = { lab: { select: { slug: true, name: true } }, _count: { select: { providers: true } } } satisfies Prisma.ModelInclude;
type ListRow = Prisma.ModelGetPayload<{ include: typeof listInclude }>;

export function toListItem(m: ListRow) {
  return {
    id: m.id, slug: m.slug, name: m.name, description: m.description, type: m.type, lab: m.lab,
    releaseDate: m.releaseDate.toISOString(), contextWindow: m.contextWindow, maxOutput: m.maxOutput,
    parameters: m.parameters, openWeights: m.openWeights, inputModalities: m.inputModalities,
    outputModalities: m.outputModalities, capabilities: m.capabilities,
    inputPrice: num(m.inputPrice), outputPrice: num(m.outputPrice), providerCount: m._count.providers,
  };
}
export type ModelListItem = ReturnType<typeof toListItem>;

const orderBy = (sort: ModelQuery["sort"]): Prisma.ModelOrderByWithRelationInput[] => {
  switch (sort) {
    case "price_asc": return [{ inputPrice: { sort: "asc", nulls: "last" } }, { name: "asc" }];
    case "price_desc": return [{ inputPrice: { sort: "desc", nulls: "last" } }, { name: "asc" }];
    case "context_desc": return [{ contextWindow: "desc" }, { name: "asc" }];
    case "context_asc": return [{ contextWindow: "asc" }, { name: "asc" }];
    case "release_asc": return [{ releaseDate: "asc" }];
    case "name": return [{ name: "asc" }];
    default: return [{ releaseDate: "desc" }];
  }
};

export async function listModels(q: ModelQuery) {
  const and: Prisma.ModelWhereInput[] = [];
  if (q.q) {
    and.push({ OR: [
      { name: { contains: q.q, mode: "insensitive" } },
      { slug: { contains: q.q, mode: "insensitive" } },
      { description: { contains: q.q, mode: "insensitive" } },
      { lab: { name: { contains: q.q, mode: "insensitive" } } },
      { capabilities: { has: q.q.toLowerCase() } },
    ] });
  }
  if (q.lab.length) and.push({ lab: { slug: { in: q.lab } } });
  if (q.provider.length) and.push({ providers: { some: { provider: { slug: { in: q.provider } } } } });
  if (q.type.length) and.push({ type: { in: q.type } });
  if (q.capability.length) and.push({ capabilities: { hasEvery: q.capability } });
  if (q.open !== undefined) and.push({ openWeights: q.open });
  if (q.minContext) and.push({ contextWindow: { gte: q.minContext } });
  if (q.maxPrice !== undefined) and.push({ inputPrice: { lte: q.maxPrice } });
  const where: Prisma.ModelWhereInput = and.length ? { AND: and } : {};

  const [total, rows] = await Promise.all([
    prisma.model.count({ where }),
    prisma.model.findMany({ where, orderBy: orderBy(q.sort), skip: (q.page - 1) * q.pageSize, take: q.pageSize, include: listInclude }),
  ]);
  return { items: rows.map(toListItem), meta: { total, page: q.page, pageSize: q.pageSize, totalPages: Math.max(1, Math.ceil(total / q.pageSize)) } };
}

export async function getModel(slug: string) {
  const m = await prisma.model.findUnique({
    where: { slug },
    include: {
      lab: true,
      providers: { include: { provider: true }, orderBy: { inputPrice: { sort: "asc", nulls: "last" } } },
      scores: { include: { benchmark: true }, orderBy: { benchmark: { name: "asc" } } },
    },
  });
  if (!m) throw new NotFoundError("Model");
  const offerings = m.providers.map((p) => ({
    provider: { slug: p.provider.slug, name: p.provider.name, region: p.provider.region },
    inputPrice: num(p.inputPrice), outputPrice: num(p.outputPrice), latencyMs: p.latencyMs, throughput: p.throughput, uptime: num(p.uptime),
  }));
  return {
    id: m.id, slug: m.slug, name: m.name, description: m.description, type: m.type,
    lab: { slug: m.lab.slug, name: m.lab.name, country: m.lab.country },
    releaseDate: m.releaseDate.toISOString(), contextWindow: m.contextWindow, maxOutput: m.maxOutput, parameters: m.parameters,
    openWeights: m.openWeights, inputModalities: m.inputModalities, outputModalities: m.outputModalities, capabilities: m.capabilities,
    inputPrice: num(m.inputPrice), outputPrice: num(m.outputPrice),
    offerings,
    cheapestProvider: offerings.find((o) => o.inputPrice != null) ?? offerings[0] ?? null,
    benchmarks: m.scores.map((s) => ({ slug: s.benchmark.slug, name: s.benchmark.name, category: s.benchmark.category, score: s.score, maxScore: s.benchmark.maxScore })),
  };
}
export type ModelDetail = Awaited<ReturnType<typeof getModel>>;

export async function compareModels(slugs: string[]) {
  const unique = [...new Set(slugs)];
  const found = await Promise.all(unique.map((s) => getModel(s)));
  // keep user-requested order; getModel throws NotFoundError for unknown slugs
  const benchmarkMap = new Map<string, { slug: string; name: string; category: string }>();
  for (const m of found) for (const b of m.benchmarks) benchmarkMap.set(b.slug, { slug: b.slug, name: b.name, category: b.category });
  return { models: found, benchmarks: [...benchmarkMap.values()] };
}

export async function getFilters() {
  const [labs, providers, caps] = await Promise.all([
    prisma.lab.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true, _count: { select: { models: true } } } }),
    prisma.provider.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true, _count: { select: { offerings: true } } } }),
    prisma.$queryRaw<{ cap: string; n: bigint }[]>`SELECT unnest("capabilities") AS cap, COUNT(*) AS n FROM "Model" GROUP BY cap ORDER BY n DESC, cap`,
  ]);
  return {
    labs: labs.map((l) => ({ slug: l.slug, name: l.name, count: l._count.models })),
    providers: providers.map((p) => ({ slug: p.slug, name: p.name, count: p._count.offerings })),
    capabilities: caps.map((c) => ({ value: c.cap, count: Number(c.n) })),
    types: ["CHAT", "REASONING", "CODE", "EMBEDDING", "IMAGE", "AUDIO"],
  };
}
