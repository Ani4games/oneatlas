import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { listModels } from "@/lib/services/models";
import { modelQuerySchema } from "@/lib/validation";
import { getRankings } from "@/lib/services/rankings";
import { listLabs } from "@/lib/services/directory";
import { GlobalSearch } from "@/components/global-search";
import { ModelCard } from "@/components/model-card";
import { Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [models, providers, labs, latest, ranking, labList] = await Promise.all([
    prisma.model.count(), prisma.provider.count(), prisma.lab.count(),
    listModels(modelQuerySchema.parse({ pageSize: "6" })),
    getRankings({ limit: 5 }),
    listLabs(),
  ]);

  return (
    <div className="space-y-14">
      <section className="mx-auto max-w-3xl pt-6 text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent-soft">AI model intelligence</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Find the right AI model, <span className="text-accent">faster</span>.</h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">Search, compare and benchmark models across labs and inference providers — pricing, context windows, capabilities and performance in one place.</p>
        <div className="mx-auto mt-8 max-w-xl"><GlobalSearch large /></div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <LinkButton href="/models">Browse models</LinkButton>
          <LinkButton href="/compare" variant="ghost">Compare side by side</LinkButton>
        </div>
        <dl className="mt-10 grid grid-cols-3 gap-3">
          {[["Models", models], ["Labs", labs], ["Providers", providers]].map(([k, v]) => (
            <div key={k as string} className="rounded-xl bg-white/[0.03] py-4 ring-1 ring-white/5"><dd className="text-2xl font-semibold tabular-nums text-white">{v}</dd><dt className="text-xs text-zinc-500">{k}</dt></div>
          ))}
        </dl>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between"><h2 className="text-lg font-semibold text-white">Latest releases</h2><Link href="/models" className="inline-flex items-center gap-1 text-sm text-accent-soft hover:text-white">All models <ArrowRight className="h-3.5 w-3.5" /></Link></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{latest.items.map((m) => <div key={m.id} className="relative"><ModelCard m={m} /></div>)}</div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-end justify-between"><h2 className="text-lg font-semibold text-white">Top models overall</h2><Link href="/rankings" className="text-sm text-accent-soft hover:text-white">Full rankings →</Link></div>
          <ol className="divide-y divide-white/5">
            {ranking.entries.map((e) => (
              <li key={e.model.slug} className="flex items-center gap-3 py-2.5">
                <span className="w-5 text-sm tabular-nums text-zinc-500">{e.rank}</span>
                <Link href={`/models/${e.model.slug}`} className="flex-1 truncate text-sm text-white hover:text-accent-soft">{e.model.name}<span className="ml-2 text-xs text-zinc-500">{e.model.lab.name}</span></Link>
                <span className="text-sm font-medium tabular-nums text-white">{e.score}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-zinc-500">Mean score across benchmarks.</p>
        </Card>
        <Card className="p-5">
          <div className="mb-4 flex items-end justify-between"><h2 className="text-lg font-semibold text-white">AI labs</h2><Link href="/labs" className="text-sm text-accent-soft hover:text-white">Directory →</Link></div>
          <ul className="grid grid-cols-2 gap-2">
            {labList.slice(0, 8).map((l) => (
              <li key={l.slug}><Link href={`/labs/${l.slug}`} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2.5 text-sm text-zinc-200 ring-1 ring-white/5 hover:bg-white/[0.07]">{l.name}<span className="text-xs text-zinc-500">{l.modelCount}</span></Link></li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
