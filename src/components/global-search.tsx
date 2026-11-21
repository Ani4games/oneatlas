"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Cpu, Building2, Server } from "lucide-react";
import { api } from "@/lib/api";

interface Results {
  models: { slug: string; name: string; type: string; lab: string }[];
  labs: { slug: string; name: string; country: string }[];
  providers: { slug: string; name: string; region: string }[];
}

export function GlobalSearch({ large = false, autoFocus = false }: { large?: boolean; autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Results | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!q.trim()) { setRes(null); return; }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      api<Results>(`/search?q=${encodeURIComponent(q.trim())}`, ctrl.signal).then((r) => { setRes(r.data); setActive(0); }).catch(() => {});
    }, 180);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  useEffect(() => {
    const click = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); input.current?.focus(); } };
    document.addEventListener("mousedown", click); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", click); document.removeEventListener("keydown", key); };
  }, []);

  const items = res ? [
    ...res.models.map((m) => ({ href: `/models/${m.slug}`, title: m.name, sub: m.lab, icon: Cpu })),
    ...res.labs.map((l) => ({ href: `/labs/${l.slug}`, title: l.name, sub: `Lab · ${l.country}`, icon: Building2 })),
    ...res.providers.map((p) => ({ href: `/providers/${p.slug}`, title: p.name, sub: `Provider · ${p.region}`, icon: Server })),
  ] : [];

  const go = (href: string) => { setOpen(false); setQ(""); router.push(href); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (items[active]) go(items[active].href); else if (q.trim()) go(`/models?q=${encodeURIComponent(q.trim())}`); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={box} className="relative w-full">
      <Search className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 ${large ? "h-5 w-5" : "h-4 w-4"}`} />
      <input
        ref={input} autoFocus={autoFocus} value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={onKey}
        placeholder="Search models, labs, providers…" aria-label="Global search" role="combobox" aria-expanded={open && items.length > 0} aria-controls="global-search-list"
        className={`w-full rounded-lg border border-white/10 bg-ink-800 pl-10 pr-3 text-white placeholder:text-zinc-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${large ? "py-3.5 text-base" : "py-2 text-sm"}`}
      />
      {open && q.trim() && (
        <div id="global-search-list" role="listbox" className="absolute z-50 mt-2 max-h-96 w-full overflow-auto rounded-xl border border-white/10 bg-ink-800 p-1 shadow-2xl">
          {items.length === 0 ? <p className="px-3 py-4 text-sm text-zinc-500">{res ? "No matches" : "Searching…"}</p> : items.map((it, i) => (
            <button key={it.href} role="option" aria-selected={i === active} onMouseEnter={() => setActive(i)} onClick={() => go(it.href)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${i === active ? "bg-white/10" : ""}`}>
              <it.icon className="h-4 w-4 shrink-0 text-zinc-500" />
              <span className="min-w-0"><span className="block truncate text-sm text-white">{it.title}</span><span className="block truncate text-xs text-zinc-500">{it.sub}</span></span>
            </button>
          ))}
          {q.trim() && <button onClick={() => go(`/models?q=${encodeURIComponent(q.trim())}`)} className="w-full rounded-lg px-3 py-2 text-left text-xs text-accent-soft hover:bg-white/5">See all model results for “{q.trim()}” →</button>}
        </div>
      )}
    </div>
  );
}
