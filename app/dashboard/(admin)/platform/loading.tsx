import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <div role="status" aria-busy="true" aria-label="Loading" className="p-4 md:p-6"><div className="space-y-3"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-full max-w-xl" /><Skeleton className="h-5 w-full max-w-3xl" /></div><div className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-[4px]" />)}</div><Skeleton className="mt-6 h-72 rounded-[4px]" /><span className="sr-only">Loading</span></div>;
}
