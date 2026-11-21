import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getModel } from "@/lib/services/models";
import { NotFoundError } from "@/lib/errors";
import { Badge, Card, ScoreBar, Stat } from "@/components/ui";
import { CompareToggle } from "@/components/model-card";
import { context, date, label, price, TYPE_LABEL, CATEGORY_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  try { return await getModel(slug); } catch (e) { if (e instanceof NotFoundError) notFound(); throw e; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try { const m = await getModel(slug); return { title: m.name, description: m.description }; } catch { return { title: "Model not found" }; }
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const m = await load((await params).slug);
  const isToken = m.inputPrice != null;
  return (
    <div className="space-y-8">
      <nav className="text-sm text-zinc-500" aria-label="Breadcrumb"><Link href="/models" className="hover:text-white">Models</Link> / <span className="text-zinc-300">{m.name}</span></nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{m.name}</h1>
          <p className="mt-1 text-sm text-zinc-400">by <Link href={`/labs/${m.lab.slug}`} className="text-accent-soft hover:text-white">{m.lab.name}</Link> · Released {date(m.releaseDate)}</p>
          <p className="mt-3 max-w-2xl text-zinc-300">{m.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5"><Badge tone="accent">{TYPE_LABEL[m.type]}</Badge>{m.openWeights ? <Badge tone="green">Open weights</Badge> : <Badge>Proprietary</Badge>}{m.parameters && <Badge>{m.parameters} params</Badge>}</div>
        </div>
        <CompareToggle slug={m.slug} />
      </header>

      <section aria-labelledby="specs" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <h2 id="specs" className="sr-only">Specifications</h2>
        <Stat label="Input / 1M tokens" value={price(m.inputPrice)} hint={isToken ? "reference list price" : "usage-based"} />
        <Stat label="Output / 1M tokens" value={price(m.outputPrice)} />
        <Stat label="Context window" value={context(m.contextWindow)} hint={m.contextWindow ? `${m.contextWindow.toLocaleString()} tokens` : undefined} />
        <Stat label="Max output" value={context(m.maxOutput)} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h2 className="mb-4 font-semibold text-white">Modalities & capabilities</h2>
          <dl className="space-y-4 text-sm">
            <div><dt className="mb-1.5 text-xs uppercase tracking-wider text-zinc-500">Input</dt><dd className="flex flex-wrap gap-1.5">{m.inputModalities.map((x) => <Badge key={x}>{label(x.toLowerCase())}</Badge>)}</dd></div>
            <div><dt className="mb-1.5 text-xs uppercase tracking-wider text-zinc-500">Output</dt><dd className="flex flex-wrap gap-1.5">{m.outputModalities.map((x) => <Badge key={x}>{label(x.toLowerCase())}</Badge>)}</dd></div>
            <div><dt className="mb-1.5 text-xs uppercase tracking-wider text-zinc-500">Capabilities</dt><dd className="flex flex-wrap gap-1.5">{m.capabilities.map((x) => <Link key={x} href={`/models?capability=${x}`}><Badge tone="accent">{label(x)}</Badge></Link>)}</dd></div>
          </dl>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-white">Benchmarks</h2>
          {m.benchmarks.length === 0 ? <p className="text-sm text-zinc-500">No benchmark scores for this model type.</p> : (
            <ul className="space-y-3">
              {m.benchmarks.map((b) => (
                <li key={b.slug}>
                  <div className="mb-1 flex items-center justify-between text-sm"><Link href={`/rankings?benchmark=${b.slug}`} className="text-zinc-200 hover:text-accent-soft">{b.name}</Link><span className="text-xs text-zinc-500">{CATEGORY_LABEL[b.category]}</span></div>
                  <ScoreBar value={b.score} max={b.maxScore} highlight />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <section aria-labelledby="providers">
        <h2 id="providers" className="mb-3 text-lg font-semibold text-white">Available providers <span className="text-sm font-normal text-zinc-500">({m.offerings.length})</span></h2>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
              <tr><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Region</th><th className="px-4 py-3 text-right">Input / 1M</th><th className="px-4 py-3 text-right">Output / 1M</th><th className="px-4 py-3 text-right">Latency</th><th className="px-4 py-3 text-right">Tokens/s</th><th className="px-4 py-3 text-right">Uptime</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5 tabular-nums">
              {m.offerings.map((o) => (
                <tr key={o.provider.slug} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3"><Link href={`/providers/${o.provider.slug}`} className="text-white hover:text-accent-soft">{o.provider.name}</Link>{m.cheapestProvider?.provider.slug === o.provider.slug && isToken && <span className="ml-2"><Badge tone="green">Lowest price</Badge></span>}</td>
                  <td className="px-4 py-3 text-zinc-400">{o.provider.region}</td>
                  <td className="px-4 py-3 text-right">{price(o.inputPrice)}</td><td className="px-4 py-3 text-right">{price(o.outputPrice)}</td>
                  <td className="px-4 py-3 text-right">{o.latencyMs} ms</td><td className="px-4 py-3 text-right">{o.throughput}</td><td className="px-4 py-3 text-right">{o.uptime}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
