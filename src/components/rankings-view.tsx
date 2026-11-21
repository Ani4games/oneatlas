"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { api } from "@/lib/api";
import type { Rankings } from "@/lib/services/rankings";
import { Badge, Card, EmptyState, ErrorState, ScoreBar, Skeleton } from "./ui";
import { CATEGORY_LABEL, price, TYPE_LABEL } from "@/lib/format";

const CATS = ["GENERAL", "REASONING", "CODING", "MATH", "MULTIMODAL"];

export function RankingsView() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const benchmark = sp.get("benchmark") ?? "";
  const category = sp.get("category") ?? "";
  const type = sp.get("type") ?? "";
  const [data, setData] = useState<Rankings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const qs = sp.toString();

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true); setError(null);
    api<Rankings>(`/rankings?${qs}`, ctrl.signal).then((r) => { setData(r.data); setLoading(false); }).catch((e) => { if (e.name !== "AbortError") { setError(e.message); setLoading(false); } });
    return () => ctrl.abort();
  }, [qs]);

  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(qs);
    for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k);
    router.replace(`${pathname}?${next}`, { scroll: false });
  };
  const pick = (kind: "overall" | "category" | "benchmark", value = "") =>
    set({ benchmark: kind === "benchmark" ? value : "", category: kind === "category" ? value : "" });
  const Tab = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} aria-pressed={active} className={clsx("rounded-lg px-3 py-1.5 text-sm transition-colors", active ? "bg-accent-deep text-white" : "bg-white/5 text-zinc-300 ring-1 ring-inset ring-white/10 hover:bg-white/10")}>{children}</button>
  );

  const multi = data && data.columns.length > 1;
  const activeBench = data?.benchmarks.find((b) => b.slug === benchmark);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2"><span className="w-20 text-xs uppercase tracking-wider text-zinc-500">View</span>
          <Tab active={!benchmark && !category} onClick={() => pick("overall")}>Overall</Tab>
          {CATS.map((c) => <Tab key={c} active={category === c} onClick={() => pick("category", c)}>{CATEGORY_LABEL[c]}</Tab>)}
        </div>
        <div className="flex flex-wrap items-center gap-2"><span className="w-20 text-xs uppercase tracking-wider text-zinc-500">Benchmark</span>
          {data?.benchmarks.map((b) => <Tab key={b.slug} active={benchmark === b.slug} onClick={() => pick("benchmark", b.slug)}>{b.name}</Tab>) ?? <Skeleton className="h-8 w-64" />}
        </div>
        <div className="flex flex-wrap items-center gap-2"><span className="w-20 text-xs uppercase tracking-wider text-zinc-500">Model type</span>
          <Tab active={!type} onClick={() => set({ type: "" })}>All</Tab>
          {["CHAT", "REASONING", "CODE"].map((t) => <Tab key={t} active={type === t} onClick={() => set({ type: t })}>{TYPE_LABEL[t]}</Tab>)}
        </div>
      </div>

      {activeBench && <p className="text-sm text-zinc-400">{activeBench.description}</p>}

      {error ? <ErrorState message={error} /> : !data || (loading && !data) ? <Skeleton className="h-96" /> : data.entries.length === 0 ? (
        <EmptyState title="No ranked models" hint="No models have enough scores for this combination." />
      ) : (
        <Card className={clsx("overflow-x-auto transition-opacity", loading && "opacity-50")}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
              <tr><th className="w-14 px-4 py-3">#</th><th className="px-4 py-3">Model</th><th className="w-56 px-4 py-3">{multi ? "Mean score" : "Score"}</th>{multi && data.columns.map((c) => <th key={c.slug} className="hidden px-3 py-3 text-right lg:table-cell">{c.name}</th>)}<th className="hidden px-4 py-3 text-right sm:table-cell">Input / 1M</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.entries.map((e) => (
                <tr key={e.model.slug} className="hover:bg-white/[0.03]">
                  <td className={clsx("px-4 py-3 tabular-nums", e.rank <= 3 ? "font-semibold text-accent-soft" : "text-zinc-500")}>{e.rank}</td>
                  <td className="px-4 py-3"><Link href={`/models/${e.model.slug}`} className="font-medium text-white hover:text-accent-soft">{e.model.name}</Link><div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">{e.model.lab.name}{e.model.openWeights && <Badge tone="green">Open</Badge>}</div></td>
                  <td className="px-4 py-3"><ScoreBar value={e.score} highlight={e.rank <= 3} /></td>
                  {multi && data.columns.map((c) => <td key={c.slug} className="hidden px-3 py-3 text-right tabular-nums text-zinc-400 lg:table-cell">{e.scores[c.slug] ?? "—"}</td>)}
                  <td className="hidden px-4 py-3 text-right tabular-nums text-zinc-300 sm:table-cell">{price(e.model.inputPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
