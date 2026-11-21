"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const MAX = 4;
const KEY = "oneatlas:compare";
interface Ctx { slugs: string[]; toggle: (slug: string) => void; remove: (slug: string) => void; clear: () => void; has: (slug: string) => boolean; full: boolean }
const CompareCtx = createContext<Ctx | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  useEffect(() => {
    try { const v = JSON.parse(localStorage.getItem(KEY) ?? "[]"); if (Array.isArray(v)) setSlugs(v.slice(0, MAX)); } catch {}
  }, []);
  const persist = useCallback((next: string[]) => { setSlugs(next); try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {} }, []);
  const toggle = useCallback((s: string) => persist(slugs.includes(s) ? slugs.filter((x) => x !== s) : slugs.length < MAX ? [...slugs, s] : slugs), [slugs, persist]);
  const remove = useCallback((s: string) => persist(slugs.filter((x) => x !== s)), [slugs, persist]);
  const clear = useCallback(() => persist([]), [persist]);
  return <CompareCtx.Provider value={{ slugs, toggle, remove, clear, has: (s) => slugs.includes(s), full: slugs.length >= MAX }}>{children}</CompareCtx.Provider>;
}

export const useCompare = () => {
  const c = useContext(CompareCtx);
  if (!c) throw new Error("useCompare must be used within CompareProvider");
  return c;
};
