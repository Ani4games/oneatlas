"use client";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import type { ModelListItem } from "@/lib/services/models";
import { Badge } from "./ui";
import { useCompare } from "./compare-context";
import { context, date, price, TYPE_LABEL } from "@/lib/format";

export function CompareToggle({ slug }: { slug: string }) {
  const { has, toggle, full } = useCompare();
  const on = has(slug);
  return (
    <button onClick={(e) => { e.preventDefault(); toggle(slug); }} disabled={!on && full} aria-pressed={on}
      title={!on && full ? "You can compare up to 4 models" : undefined}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${on ? "bg-accent-deep text-white ring-accent" : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"}`}>
      {on ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}{on ? "Added" : "Compare"}
    </button>
  );
}

export function ModelCard({ m }: { m: ModelListItem }) {
  return (
    <article className="group flex h-full flex-col rounded-xl border border-white/10 bg-ink-800/60 p-4 transition-colors hover:border-accent/50">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/models/${m.slug}`} className="block truncate font-semibold text-white after:absolute after:inset-0 group-hover:text-accent-soft"><span className="sr-only">View </span>{m.name}</Link>
          <Link href={`/labs/${m.lab.slug}`} className="relative z-10 text-xs text-zinc-500 hover:text-zinc-300">{m.lab.name}</Link>
        </div>
        <div className="relative z-10 shrink-0"><CompareToggle slug={m.slug} /></div>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{m.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="accent">{TYPE_LABEL[m.type]}</Badge>
        {m.openWeights && <Badge tone="green">Open weights</Badge>}
        {m.capabilities.slice(0, 2).map((c) => <Badge key={c}>{c}</Badge>)}
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-xs">
        <div><dt className="text-zinc-500">Input / 1M</dt><dd className="mt-0.5 font-medium tabular-nums text-white">{price(m.inputPrice)}</dd></div>
        <div><dt className="text-zinc-500">Output / 1M</dt><dd className="mt-0.5 font-medium tabular-nums text-white">{price(m.outputPrice)}</dd></div>
        <div><dt className="text-zinc-500">Context</dt><dd className="mt-0.5 font-medium tabular-nums text-white">{context(m.contextWindow)}</dd></div>
      </dl>
      <div className="mt-3 flex justify-between text-[11px] text-zinc-500"><span>Released {date(m.releaseDate)}</span><span>{m.providerCount} provider{m.providerCount === 1 ? "" : "s"}</span></div>
    </article>
  );
}
