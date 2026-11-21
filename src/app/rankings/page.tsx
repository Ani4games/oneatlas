import { Suspense } from "react";
import type { Metadata } from "next";
import { RankingsView } from "@/components/rankings-view";
import { PageHeader, Skeleton } from "@/components/ui";

export const metadata: Metadata = { title: "Rankings & benchmarks" };

export default function RankingsPage() {
  return (
    <>
      <PageHeader title="Rankings & benchmarks" subtitle="Leaderboards by benchmark or category. Overall and category views rank by the mean of available scores." />
      <Suspense fallback={<Skeleton className="h-96" />}><RankingsView /></Suspense>
    </>
  );
}
