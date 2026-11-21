import Link from "next/link";
import type { Metadata } from "next";
import { listProviders } from "@/lib/services/directory";
import { Badge, Card, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Providers" };
export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  const providers = await listProviders();
  return (
    <>
      <PageHeader title="Providers" subtitle="Inference platforms and APIs that host models — compare what they serve." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((p) => (
          <Link key={p.slug} href={`/providers/${p.slug}`} className="group">
            <Card className="h-full p-5 transition-colors group-hover:border-accent/50">
              <div className="flex items-start justify-between"><h2 className="font-semibold text-white group-hover:text-accent-soft">{p.name}</h2><Badge>{p.region}</Badge></div>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{p.description}</p>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-xs"><div><dt className="text-zinc-500">Models</dt><dd className="font-medium tabular-nums text-white">{p.modelCount}</dd></div><div><dt className="text-zinc-500">Avg tok/s</dt><dd className="font-medium tabular-nums text-white">{p.avgThroughput}</dd></div><div><dt className="text-zinc-500">Avg latency</dt><dd className="font-medium tabular-nums text-white">{p.avgLatencyMs} ms</dd></div></dl>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
