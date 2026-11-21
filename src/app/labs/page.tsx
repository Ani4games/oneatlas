import Link from "next/link";
import type { Metadata } from "next";
import { listLabs } from "@/lib/services/directory";
import { Badge, Card, PageHeader } from "@/components/ui";
import { date } from "@/lib/format";

export const metadata: Metadata = { title: "AI labs" };
export const dynamic = "force-dynamic";

export default async function LabsPage() {
  const labs = await listLabs();
  return (
    <>
      <PageHeader title="AI labs" subtitle="Companies and research groups building foundation models." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {labs.map((l) => (
          <Link key={l.slug} href={`/labs/${l.slug}`} className="group">
            <Card className="h-full p-5 transition-colors group-hover:border-accent/50">
              <div className="flex items-start justify-between"><h2 className="font-semibold text-white group-hover:text-accent-soft">{l.name}</h2><span className="text-xs text-zinc-500">{l.country} · {l.founded}</span></div>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{l.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <Badge tone="accent">{l.modelCount} model{l.modelCount === 1 ? "" : "s"}</Badge>{l.openWeights && <Badge tone="green">Open weights</Badge>}
                {l.latestModel && <span>Latest: {l.latestModel.name} ({date(l.latestModel.releaseDate)})</span>}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
