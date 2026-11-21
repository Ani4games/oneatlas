import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProvider } from "@/lib/services/directory";
import { NotFoundError } from "@/lib/errors";
import { Badge, Card } from "@/components/ui";
import { context, price, TYPE_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  try { return await getProvider(slug); } catch (e) { if (e instanceof NotFoundError) notFound(); throw e; }
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try { const p = await getProvider((await params).slug); return { title: p.name, description: p.description }; } catch { return { title: "Provider not found" }; }
}

export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await load((await params).slug);
  return (
    <div className="space-y-8">
      <nav className="text-sm text-zinc-500"><Link href="/providers" className="hover:text-white">Providers</Link> / <span className="text-zinc-300">{p.name}</span></nav>
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{p.name}</h1>
        <p className="mt-2 max-w-2xl text-zinc-300">{p.description}</p>
        <div className="mt-3 flex items-center gap-2 text-sm"><Badge>{p.region}</Badge><a href={p.website} target="_blank" rel="noopener noreferrer" className="text-accent-soft hover:text-white">Website ↗</a></div>
      </header>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Supported models <span className="text-sm font-normal text-zinc-500">({p.offerings.length})</span></h2>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500"><tr><th className="px-4 py-3">Model</th><th className="px-4 py-3">Type</th><th className="px-4 py-3 text-right">Context</th><th className="px-4 py-3 text-right">Input / 1M</th><th className="px-4 py-3 text-right">Output / 1M</th><th className="px-4 py-3 text-right">Latency</th><th className="px-4 py-3 text-right">Tokens/s</th></tr></thead>
            <tbody className="divide-y divide-white/5 tabular-nums">
              {p.offerings.map((o) => (
                <tr key={o.model.slug} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3"><Link href={`/models/${o.model.slug}`} className="text-white hover:text-accent-soft">{o.model.name}</Link><div className="text-xs text-zinc-500">{o.model.lab.name}</div></td>
                  <td className="px-4 py-3"><Badge tone="accent">{TYPE_LABEL[o.model.type]}</Badge></td>
                  <td className="px-4 py-3 text-right">{context(o.model.contextWindow)}</td><td className="px-4 py-3 text-right">{price(o.inputPrice)}</td><td className="px-4 py-3 text-right">{price(o.outputPrice)}</td>
                  <td className="px-4 py-3 text-right">{o.latencyMs} ms</td><td className="px-4 py-3 text-right">{o.throughput}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
