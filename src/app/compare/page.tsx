import { Suspense } from "react";
import type { Metadata } from "next";
import { CompareView } from "@/components/compare-view";
import { PageHeader, Skeleton } from "@/components/ui";

export const metadata: Metadata = { title: "Compare models" };

export default function ComparePage() {
  return (
    <>
      <PageHeader title="Compare models" subtitle="Put up to four models side by side — pricing, context, capabilities and benchmarks. The best value in each row is highlighted." />
      <Suspense fallback={<Skeleton className="h-96" />}><CompareView /></Suspense>
    </>
  );
}
