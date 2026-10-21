import { FinanceScreen } from "@/features/platform/finance/FinanceScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <FinanceScreen searchParams={searchParams} />; }
