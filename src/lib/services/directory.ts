import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { toListItem } from "./models";

export async function listLabs() {
  const labs = await prisma.lab.findMany({ orderBy: { name: "asc" }, include: { models: { select: { releaseDate: true, name: true }, orderBy: { releaseDate: "desc" } } } });
  return labs.map((l) => ({
    slug: l.slug, name: l.name, country: l.country, founded: l.founded, website: l.website, description: l.description, openWeights: l.openWeights,
    modelCount: l.models.length, latestModel: l.models[0] ? { name: l.models[0].name, releaseDate: l.models[0].releaseDate.toISOString() } : null,
  }));
}

export async function getLab(slug: string) {
  const l = await prisma.lab.findUnique({
    where: { slug },
    include: { models: { orderBy: { releaseDate: "desc" }, include: { lab: { select: { slug: true, name: true } }, _count: { select: { providers: true } }, providers: { include: { provider: { select: { slug: true, name: true } } } } } } },
  });
  if (!l) throw new NotFoundError("Lab");
  const providers = new Map<string, { slug: string; name: string }>();
  for (const m of l.models) for (const p of m.providers) providers.set(p.provider.slug, p.provider);
  return {
    slug: l.slug, name: l.name, country: l.country, founded: l.founded, website: l.website, description: l.description, openWeights: l.openWeights,
    models: l.models.map(toListItem), providers: [...providers.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export async function listProviders() {
  const ps = await prisma.provider.findMany({ orderBy: { name: "asc" }, include: { offerings: { select: { throughput: true, latencyMs: true } } } });
  return ps.map((p) => ({
    slug: p.slug, name: p.name, region: p.region, website: p.website, description: p.description, modelCount: p.offerings.length,
    avgThroughput: p.offerings.length ? Math.round(p.offerings.reduce((a, o) => a + o.throughput, 0) / p.offerings.length) : 0,
    avgLatencyMs: p.offerings.length ? Math.round(p.offerings.reduce((a, o) => a + o.latencyMs, 0) / p.offerings.length) : 0,
  }));
}

export async function getProvider(slug: string) {
  const p = await prisma.provider.findUnique({
    where: { slug },
    include: { offerings: { include: { model: { include: { lab: { select: { slug: true, name: true } } } } }, orderBy: { model: { name: "asc" } } } },
  });
  if (!p) throw new NotFoundError("Provider");
  return {
    slug: p.slug, name: p.name, region: p.region, website: p.website, description: p.description,
    offerings: p.offerings.map((o) => ({
      model: { slug: o.model.slug, name: o.model.name, type: o.model.type, lab: o.model.lab, contextWindow: o.model.contextWindow },
      inputPrice: o.inputPrice == null ? null : Number(o.inputPrice), outputPrice: o.outputPrice == null ? null : Number(o.outputPrice), latencyMs: o.latencyMs, throughput: o.throughput, uptime: Number(o.uptime),
    })),
  };
}

export async function globalSearch(q: string) {
  const contains = { contains: q, mode: "insensitive" as const };
  const [models, labs, providers] = await Promise.all([
    prisma.model.findMany({ where: { OR: [{ name: contains }, { slug: contains }, { lab: { name: contains } }] }, take: 6, orderBy: { releaseDate: "desc" }, select: { slug: true, name: true, type: true, lab: { select: { name: true } } } }),
    prisma.lab.findMany({ where: { OR: [{ name: contains }, { slug: contains }] }, take: 4, select: { slug: true, name: true, country: true } }),
    prisma.provider.findMany({ where: { OR: [{ name: contains }, { slug: contains }] }, take: 4, select: { slug: true, name: true, region: true } }),
  ]);
  return { models: models.map((m) => ({ slug: m.slug, name: m.name, type: m.type, lab: m.lab.name })), labs, providers };
}
