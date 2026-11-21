"use client";
import { ErrorState } from "@/components/ui";
export default function Error({ reset }: { error: Error; reset: () => void }) { return <ErrorState message="An unexpected error occurred while loading this page." retry={reset} />; }
