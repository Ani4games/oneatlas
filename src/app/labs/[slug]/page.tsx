import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLab } from "@/lib/services/directory";
import { NotFoundError } from "@/lib/errors";
import { ModelCard } from "@/components/model-card";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  try { return await getLab(slug); } catch (e) { if (e instanceof NotFoundError) notFound(); throw e; }
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try { const l = await getLab((await params).slug); return { title: l.name, description: l.description }; } catch { return { title: "Lab not found" }; }
}

export default async function LabPage({ params }: { params: Promise<{ slug: string }> }) {
  const l = await load((await params).slug);
  return (
    <div className="space-y-8">
      <nav className="text-sm text-zinc-500"><Link href="/labs" className="hover:text-white">Labs</Link> / <span className="text-zinc-300">{l.name}</span></nav>
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{l.name}</h1>
        <p className="mt-2 max-w-2xl text-zinc-300">{l.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-400"><Badge>{l.country}</Badge><Badge>Founded {l.founded}</Badge>{l.openWeights && <Badge tone="green">Open weights</Badge>}<a href={l.website} target="_blank" rel="noopener noreferrer" className="text-accent-soft hover:text-white">Website ↗</a></div>
      </header>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Models & releases <span className="text-sm font-normal text-zinc-500">({l.models.length})</span></h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{l.models.map((m) => <div key={m.id} className="relative"><ModelCard m={m} /></div>)}</div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Where to access these models</h2>
        <div className="flex flex-wrap gap-2">{l.providers.map((p) => <Link key={p.slug} href={`/providers/${p.slug}`} className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white/10">{p.name}</Link>)}</div>
      </section>
    </div>
  );
}
