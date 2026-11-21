"use client";
import Link from "next/link";
import { X } from "lucide-react";
import { useCompare } from "./compare-context";
import { usePathname } from "next/navigation";

export function CompareTray() {
  const { slugs, remove, clear } = useCompare();
  const path = usePathname();
  if (!slugs.length || path.startsWith("/compare")) return null;
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-xl items-center gap-2 rounded-xl border border-white/15 bg-ink-800/95 p-2 pl-3 shadow-2xl backdrop-blur">
      <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
        {slugs.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full bg-white/10 py-0.5 pl-2.5 pr-1 text-xs text-white">
            {s}<button onClick={() => remove(s)} aria-label={`Remove ${s}`} className="rounded-full p-0.5 hover:bg-white/20"><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
      <button onClick={clear} className="text-xs text-zinc-400 hover:text-white">Clear</button>
      <Link href={`/compare?models=${slugs.join(",")}`} aria-disabled={slugs.length < 2}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${slugs.length < 2 ? "pointer-events-none bg-white/10 text-zinc-500" : "bg-accent-deep text-white hover:bg-accent"}`}>
        Compare ({slugs.length})
      </Link>
    </div>
  );
}
