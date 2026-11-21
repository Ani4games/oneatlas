export const price = (n: number | null | undefined) => (n == null ? "—" : n === 0 ? "Free" : n < 1 ? `$${n.toFixed(2)}` : `$${Number.isInteger(n) ? n : n.toFixed(2)}`);

export function context(n: number) {
  if (!n) return "—";
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
}

export const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

export const TYPE_LABEL: Record<string, string> = { CHAT: "Chat", REASONING: "Reasoning", CODE: "Code", EMBEDDING: "Embedding", IMAGE: "Image", AUDIO: "Audio" };
export const CATEGORY_LABEL: Record<string, string> = { GENERAL: "General", REASONING: "Reasoning", CODING: "Coding", MATH: "Math", MULTIMODAL: "Multimodal" };
export const label = (s: string) => s.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
