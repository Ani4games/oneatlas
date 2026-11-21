import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { CompareProvider } from "@/components/compare-context";
import { CompareTray } from "@/components/compare-tray";

export const metadata: Metadata = {
  title: { default: "OneAtlas — AI model discovery & intelligence", template: "%s · OneAtlas" },
  description: "Discover, compare and evaluate AI models across labs and providers: pricing, context windows, capabilities and benchmarks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <CompareProvider>
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
          <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500">
            OneAtlas MVP · Specs, prices and benchmark scores are an illustrative sample dataset, not live data.
          </footer>
          <CompareTray />
        </CompareProvider>
      </body>
    </html>
  );
}
