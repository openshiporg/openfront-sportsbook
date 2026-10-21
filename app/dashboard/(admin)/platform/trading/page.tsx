import { TradingScreen } from "@/features/platform/trading/TradingScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <TradingScreen searchParams={searchParams} />; }
