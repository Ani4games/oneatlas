import { Suspense } from "react";
import type { Metadata } from "next";
import { ModelExplorer } from "@/components/model-explorer";
import { PageHeader, Skeleton } from "@/components/ui";

export const metadata: Metadata = { title: "Models" };

export default function ModelsPage() {
  return (
    <>
      <PageHeader title="Models" subtitle="Browse and filter AI models by lab, provider, capability and type. Sort by price, context window or release date." />
      <Suspense fallback={<Skeleton className="h-96" />}><ModelExplorer /></Suspense>
    </>
  );
}
