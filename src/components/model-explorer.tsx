"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import type { ModelListItem } from "@/lib/services/models";
import { ModelCard } from "./model-card";
import { EmptyState, ErrorState, Skeleton } from "./ui";
import { label, TYPE_LABEL } from "@/lib/format";

interface Filters {
  labs: { slug: string; name: string; count: number }[];
  providers: { slug: string; name: string; count: number }[];
  capabilities: { value: string; count: number }[];
  types: string[];
}
interface Meta { total: number; page: number; totalPages: number; pageSize: number }

const SORTS = [
  ["release_desc", "Newest"], ["release_asc", "Oldest"], ["price_asc", "Price: low to high"], ["price_desc", "Price: high to low"],
  ["context_desc", "Context: largest"], ["context_asc", "Context: smallest"], ["name", "Name A–Z"],
] as const;
const MULTI = ["lab", "provider", "type", "capability"] as const;

function CheckGroup({ title, options, selected, onToggle }: { title: string; options: { value: string; label: string; count?: number }[]; selected: string[]; onToggle: (v: string) => void }) {
  const [all, setAll] = useState(false);
  const shown = all ? options : options.slice(0, 7);
  return (
    <fieldset className="border-b border-white/5 pb-4">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</legend>
      <div className="space-y-1">
        {shown.map((o) => (
          <label key={o.value} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm text-zinc-300 hover:bg-white/5">
            <input type="checkbox" checked={selected.includes(o.value)} onChange={() => onToggle(o.value)} className="h-3.5 w-3.5 rounded border-white/20 bg-ink-700 accent-[#7c8cff]" />
            <span className="flex-1 truncate">{o.label}</span>
            {o.count != null && <span className="text-xs tabular-nums text-zinc-600">{o.count}</span>}
          </label>
        ))}
      </div>
      {options.length > 7 && <button onClick={() => setAll(!all)} className="mt-1 text-xs text-accent-soft hover:text-white">{all ? "Show less" : `Show all ${options.length}`}</button>}
    </fieldset>
  );
}

export function ModelExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [filters, setFilters] = useState<Filters | null>(null);
  const [items, setItems] = useState<ModelListItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(sp.get("q") ?? "");
  const [retry, setRetry] = useState(0);
  const spStr = sp.toString();
  const lastSearch = useRef(sp.get("q") ?? "");

  const get = (k: string) => sp.get(k)?.split(",").filter(Boolean) ?? [];

  const update = useCallback((patch: Record<string, string | null>, keepPage = false) => {
    const next = new URLSearchParams(spStr);
    for (const [k, v] of Object.entries(patch)) v ? next.set(k, v) : next.delete(k);
    if (!keepPage) next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [spStr, router, pathname]);

  const toggle = (key: string, v: string) => {
    const cur = get(key);
    update({ [key]: (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).join(",") || null });
  };

  // Debounce text search into URL
  useEffect(() => {
    if (search === lastSearch.current) return;
    const t = setTimeout(() => { lastSearch.current = search; update({ q: search.trim() || null }); }, 250);
    return () => clearTimeout(t);
  }, [search, update]);

  useEffect(() => { api<Filters>("/filters").then((r) => setFilters(r.data)).catch(() => {}); }, []);

  // Fetch whenever URL params change; abort stale requests
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true); setError(null);
    const params = new URLSearchParams(spStr);
    params.set("pageSize", "12");
    api<ModelListItem[]>(`/models?${params}`, ctrl.signal)
      .then((r) => { setItems(r.data); setMeta(r.meta); setLoading(false); })
      .catch((e) => { if (e.name !== "AbortError") { setError(e.message); setLoading(false); } });
    return () => ctrl.abort();
  }, [spStr, retry]);

  const activeCount = useMemo(() => MULTI.reduce((n, k) => n + get(k).length, 0) + (sp.get("open") ? 1 : 0) + (sp.get("q") ? 1 : 0) + (sp.get("minContext") ? 1 : 0) + (sp.get("maxPrice") ? 1 : 0), [spStr]); // eslint-disable-line
  const clearAll = () => { setSearch(""); lastSearch.current = ""; router.replace(pathname, { scroll: false }); };
  const sort = sp.get("sort") ?? "release_desc";
  const page = Number(sp.get("page") ?? 1);

  const sidebar = (
    <div className="space-y-4">
      {filters && <>
        <CheckGroup title="Type" options={filters.types.map((t) => ({ value: t, label: TYPE_LABEL[t] }))} selected={get("type")} onToggle={(v) => toggle("type", v)} />
        <CheckGroup title="Lab" options={filters.labs.map((l) => ({ value: l.slug, label: l.name, count: l.count }))} selected={get("lab")} onToggle={(v) => toggle("lab", v)} />
        <CheckGroup title="Provider" options={filters.providers.map((p) => ({ value: p.slug, label: p.name, count: p.count }))} selected={get("provider")} onToggle={(v) => toggle("provider", v)} />
        <CheckGroup title="Capabilities" options={filters.capabilities.map((c) => ({ value: c.value, label: label(c.value), count: c.count }))} selected={get("capability")} onToggle={(v) => toggle("capability", v)} />
      </>}
      <fieldset className="space-y-3 pb-2">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Limits</legend>
        <label className="block text-sm text-zinc-300">Min context window
          <select value={sp.get("minContext") ?? ""} onChange={(e) => update({ minContext: e.target.value || null })} className="mt-1 w-full rounded-md border border-white/10 bg-ink-700 px-2 py-1.5 text-sm">
            <option value="">Any</option><option value="32000">32K+</option><option value="128000">128K+</option><option value="200000">200K+</option><option value="1000000">1M+</option>
          </select>
        </label>
        <label className="block text-sm text-zinc-300">Max input price / 1M tokens
          <select value={sp.get("maxPrice") ?? ""} onChange={(e) => update({ maxPrice: e.target.value || null })} className="mt-1 w-full rounded-md border border-white/10 bg-ink-700 px-2 py-1.5 text-sm">
            <option value="">Any</option><option value="0.25">≤ $0.25</option><option value="1">≤ $1</option><option value="3">≤ $3</option><option value="10">≤ $10</option>
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={sp.get("open") === "true"} onChange={(e) => update({ open: e.target.checked ? "true" : null })} className="h-3.5 w-3.5 accent-[#7c8cff]" /> Open weights only
        </label>
      </fieldset>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className={`${showFilters ? "block" : "hidden"} lg:block`} aria-label="Filters">{sidebar}</aside>
      <section aria-live="polite">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by name, lab or capability…" aria-label="Search models"
              className="w-full rounded-lg border border-white/10 bg-ink-800 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-accent focus:outline-none" />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-400">Sort
            <select value={sort} onChange={(e) => update({ sort: e.target.value === "release_desc" ? null : e.target.value })} className="rounded-lg border border-white/10 bg-ink-800 px-2 py-2 text-sm text-white">
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-sm text-zinc-200 ring-1 ring-white/10 lg:hidden"><SlidersHorizontal className="h-4 w-4" />Filters{activeCount > 0 && ` (${activeCount})`}</button>
        </div>

        <div className="mb-4 flex min-h-6 items-center justify-between text-sm text-zinc-400">
          <span>{meta ? `${meta.total} model${meta.total === 1 ? "" : "s"}` : " "}</span>
          {activeCount > 0 && <button onClick={clearAll} className="inline-flex items-center gap-1 text-accent-soft hover:text-white"><X className="h-3.5 w-3.5" />Clear all filters</button>}
        </div>

        {error ? <ErrorState message={error} retry={() => setRetry((r) => r + 1)} /> : loading && !items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52" />)}</div>
        ) : items.length === 0 ? (
          <EmptyState title="No models match your filters" hint="Try removing a filter or broadening your search." action={<button onClick={clearAll} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15">Clear filters</button>} />
        ) : (
          <div className={`grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${loading ? "opacity-50" : ""}`}>{items.map((m) => <div key={m.id} className="relative"><ModelCard m={m} /></div>)}</div>
        )}

        {meta && meta.totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
            <button disabled={page <= 1} onClick={() => update({ page: String(page - 1) }, true)} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-sm ring-1 ring-white/10 disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Prev</button>
            <span className="text-sm tabular-nums text-zinc-400">Page {meta.page} of {meta.totalPages}</span>
            <button disabled={page >= meta.totalPages} onClick={() => update({ page: String(page + 1) }, true)} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-sm ring-1 ring-white/10 disabled:opacity-40">Next<ChevronRight className="h-4 w-4" /></button>
          </nav>
        )}
      </section>
    </div>
  );
}
