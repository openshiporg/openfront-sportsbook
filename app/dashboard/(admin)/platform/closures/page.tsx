import { ClosuresScreen } from "@/features/platform/closures/ClosuresScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <ClosuresScreen searchParams={searchParams} />; }
