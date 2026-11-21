"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, X } from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";
import type { ModelDetail, ModelListItem } from "@/lib/services/models";
import { useCompare } from "./compare-context";
import { Badge, Card, EmptyState, ErrorState, Skeleton } from "./ui";
import { context, date, label, price, TYPE_LABEL } from "@/lib/format";

interface CompareData { models: ModelDetail[]; benchmarks: { slug: string; name: string; category: string }[] }

function Picker({ exclude, onPick }: { exclude: string[]; onPick: (slug: string) => void }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<ModelListItem[]>([]);
  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => api<ModelListItem[]>(`/models?q=${encodeURIComponent(q)}&pageSize=8&sort=name`, ctrl.signal).then((r) => setRes(r.data)).catch(() => {}), 150);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);
  return (
    <div className="rounded-xl border border-white/10 bg-ink-800 p-3">
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a model to add…" aria-label="Search models to compare" className="w-full rounded-md border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-accent focus:outline-none" />
      <ul className="mt-2 max-h-64 overflow-auto">
        {res.filter((m) => !exclude.includes(m.slug)).map((m) => (
          <li key={m.slug}><button onClick={() => onPick(m.slug)} className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-white/10"><span className="text-white">{m.name}</span><span className="text-xs text-zinc-500">{m.lab.name}</span></button></li>
        ))}
      </ul>
    </div>
  );
}

type Row = { key: string; label: string; best?: "min" | "max"; get: (m: ModelDetail) => number | null; render: (m: ModelDetail) => React.ReactNode };

export function CompareView() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { slugs: saved } = useCompare();
  const urlSlugs = sp.get("models")?.split(",").filter(Boolean) ?? [];
  const [data, setData] = useState<CompareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // First visit with no URL state: adopt the tray selection.
  useEffect(() => { if (!urlSlugs.length && saved.length) router.replace(`${pathname}?models=${saved.join(",")}`); }, [saved.length]); // eslint-disable-line

  const key = urlSlugs.join(",");
  useEffect(() => {
    if (urlSlugs.length < 2) { setData(null); setError(null); return; }
    const ctrl = new AbortController();
    setLoading(true); setError(null);
    api<CompareData>(`/compare?models=${key}`, ctrl.signal).then((r) => { setData(r.data); setLoading(false); }).catch((e) => { if (e.name !== "AbortError") { setError(e.message); setLoading(false); } });
    return () => ctrl.abort();
  }, [key]); // eslint-disable-line

  const setSlugs = (next: string[]) => router.replace(next.length ? `${pathname}?models=${next.join(",")}` : pathname);

  const rows: Row[] = [
    { key: "in", label: "Input price / 1M", best: "min", get: (m) => m.inputPrice, render: (m) => price(m.inputPrice) },
    { key: "out", label: "Output price / 1M", best: "min", get: (m) => m.outputPrice, render: (m) => price(m.outputPrice) },
    { key: "ctx", label: "Context window", best: "max", get: (m) => m.contextWindow || null, render: (m) => context(m.contextWindow) },
    { key: "max", label: "Max output", best: "max", get: (m) => m.maxOutput || null, render: (m) => context(m.maxOutput) },
    { key: "rel", label: "Released", get: () => null, render: (m) => date(m.releaseDate) },
    { key: "type", label: "Type", get: () => null, render: (m) => TYPE_LABEL[m.type] },
    { key: "open", label: "Weights", get: () => null, render: (m) => (m.openWeights ? "Open" : "Proprietary") },
    { key: "prov", label: "Providers", best: "max", get: (m) => m.offerings.length, render: (m) => m.offerings.length },
    { key: "in-mod", label: "Input modalities", get: () => null, render: (m) => m.inputModalities.map((x) => label(x.toLowerCase())).join(", ") },
  ];
  const best = (vals: (number | null)[], mode?: "min" | "max") => {
    const nums = vals.filter((v): v is number => v != null && v > 0);
    if (!mode || nums.length < 2 || new Set(nums).size === 1) return null;
    return mode === "min" ? Math.min(...nums) : Math.max(...nums);
  };

  const Cell = ({ children, hl }: { children: React.ReactNode; hl?: boolean }) => <td className={clsx("px-4 py-3 tabular-nums", hl ? "font-semibold text-emerald-300" : "text-zinc-200")}>{children}</td>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {urlSlugs.map((s) => <span key={s} className="inline-flex items-center gap-1 rounded-full bg-white/10 py-1 pl-3 pr-1.5 text-sm text-white">{data?.models.find((m) => m.slug === s)?.name ?? s}<button onClick={() => setSlugs(urlSlugs.filter((x) => x !== s))} aria-label={`Remove ${s}`} className="rounded-full p-0.5 hover:bg-white/20"><X className="h-3.5 w-3.5" /></button></span>)}
        {urlSlugs.length < 4 && <button onClick={() => setAdding(!adding)} className="inline-flex items-center gap-1 rounded-full bg-accent-deep px-3 py-1 text-sm text-white hover:bg-accent"><Plus className="h-3.5 w-3.5" />Add model</button>}
      </div>
      {adding && <div className="max-w-md"><Picker exclude={urlSlugs} onPick={(s) => { setSlugs([...urlSlugs, s]); setAdding(false); }} /></div>}

      {error ? <ErrorState message={error} /> : urlSlugs.length < 2 ? (
        <EmptyState title="Pick at least two models" hint="Use “Add model” above, or press Compare on any model card." action={<Link href="/models" className="text-sm text-accent-soft hover:text-white">Browse models →</Link>} />
      ) : !data ? <Skeleton className="h-96" /> : (
        <Card className={clsx("overflow-x-auto transition-opacity", loading && "opacity-50")}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="w-44 px-4 py-4" />
                {data.models.map((m) => (
                  <th key={m.slug} className="px-4 py-4 align-top">
                    <Link href={`/models/${m.slug}`} className="text-base font-semibold text-white hover:text-accent-soft">{m.name}</Link>
                    <div className="mt-0.5 text-xs font-normal text-zinc-500">{m.lab.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => {
                const b = best(data.models.map(r.get), r.best);
                return <tr key={r.key}><th scope="row" className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">{r.label}</th>{data.models.map((m) => <Cell key={m.slug} hl={b != null && r.get(m) === b}>{r.render(m)}</Cell>)}</tr>;
              })}
              <tr><th scope="row" className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Capabilities</th>{data.models.map((m) => <td key={m.slug} className="px-4 py-3"><div className="flex flex-wrap gap-1">{m.capabilities.map((c) => <Badge key={c}>{label(c)}</Badge>)}</div></td>)}</tr>
              <tr className="bg-white/[0.02]"><th colSpan={data.models.length + 1} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-accent-soft">Benchmarks (higher is better)</th></tr>
              {data.benchmarks.map((bm) => {
                const vals = data.models.map((m) => m.benchmarks.find((x) => x.slug === bm.slug)?.score ?? null);
                const top = best(vals, "max");
                return <tr key={bm.slug}><th scope="row" className="px-4 py-3 text-xs font-medium text-zinc-400">{bm.name}</th>{vals.map((v, i) => <Cell key={i} hl={top != null && v === top}>{v ?? <span className="text-zinc-600">—</span>}</Cell>)}</tr>;
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
