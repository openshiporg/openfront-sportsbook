import { TaxScreen } from "@/features/platform/finance/tax/TaxScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <TaxScreen searchParams={searchParams} />; }
