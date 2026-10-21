'use client';

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="p-4 md:p-6"><section role="alert" className="mx-auto max-w-2xl rounded-xl border border-destructive/30 bg-card p-6 text-card-foreground shadow-sm"><TriangleAlert className="h-6 w-6 text-destructive" aria-hidden="true" /><h1 className="mt-3 text-xl font-semibold">This page couldn&apos;t be loaded</h1><p className="mt-2 text-sm text-muted-foreground">Try again, or sign in again if your session has expired.{error.digest ? ` Reference: ${error.digest}` : ""}</p><Button type="button" onClick={reset} className="mt-5">Try again</Button></section></div>;
}
