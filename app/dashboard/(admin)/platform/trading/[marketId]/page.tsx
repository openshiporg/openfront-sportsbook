import { TradingDetailScreen } from "@/features/platform/trading/TradingDetailScreen";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ marketId: string }> }) {
  return <TradingDetailScreen marketId={(await params).marketId} />;
}
