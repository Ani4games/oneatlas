"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Compass } from "lucide-react";
import clsx from "clsx";
import { GlobalSearch } from "./global-search";
import { useCompare } from "./compare-context";

const NAV = [
  { href: "/models", label: "Models" },
  { href: "/rankings", label: "Rankings" },
  { href: "/compare", label: "Compare" },
  { href: "/labs", label: "Labs" },
  { href: "/providers", label: "Providers" },
];

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { slugs } = useCompare();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white"><Compass className="h-5 w-5 text-accent" />OneAtlas</Link>
        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={clsx("rounded-md px-3 py-1.5 text-sm transition-colors", path.startsWith(n.href) ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white")}>
              {n.label}{n.href === "/compare" && slugs.length > 0 && <span className="ml-1.5 rounded-full bg-accent-deep px-1.5 text-[10px] text-white">{slugs.length}</span>}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden w-full max-w-sm md:block"><GlobalSearch /></div>
        <button className="ml-auto rounded-md p-2 text-zinc-300 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
      {open && (
        <div className="space-y-3 border-t border-white/10 px-4 pb-4 pt-3 md:hidden">
          <GlobalSearch />
          <nav className="grid grid-cols-2 gap-1" aria-label="Mobile">
            {NAV.map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-md bg-white/5 px-3 py-2 text-sm text-zinc-200">{n.label}</Link>)}
          </nav>
        </div>
      )}
    </header>
  );
}
