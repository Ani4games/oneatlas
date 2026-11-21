import Link from "next/link";
import clsx from "clsx";

export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "accent" | "green" | "amber" }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
      tone === "default" && "bg-white/5 text-zinc-300 ring-white/10",
      tone === "accent" && "bg-accent/10 text-accent-soft ring-accent/30",
      tone === "green" && "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
      tone === "amber" && "bg-amber-500/10 text-amber-300 ring-amber-500/30")}>{children}</span>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("rounded-xl border border-white/10 bg-ink-800/60", className)}>{children}</div>;
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] p-3 ring-1 ring-white/5">
      <div className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white tabular-nums">{value}</div>
      {hint && <div className="text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}

export function ScoreBar({ value, max = 100, highlight }: { value: number; max?: number; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className={clsx("h-full rounded-full", highlight ? "bg-accent" : "bg-zinc-500")} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="w-10 text-right text-xs tabular-nums text-zinc-300">{value}</span>
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 p-10 text-center">
      <p className="font-medium text-white">{title}</p>
      {hint && <p className="mt-1 text-sm text-zinc-400">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-center">
      <p className="font-medium text-red-300">Something went wrong</p>
      <p className="mt-1 text-sm text-zinc-400">{message}</p>
      {retry && <button onClick={retry} className="mt-4 rounded-md bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15">Try again</button>}
    </div>
  );
}

export const LinkButton = ({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "ghost" }) => (
  <Link href={href} className={clsx("inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
    variant === "primary" ? "bg-accent-deep text-white hover:bg-accent" : "bg-white/5 text-zinc-200 ring-1 ring-white/10 hover:bg-white/10")}>{children}</Link>
);

export const Skeleton = ({ className }: { className?: string }) => <div className={clsx("animate-pulse rounded-lg bg-white/5", className)} />;
