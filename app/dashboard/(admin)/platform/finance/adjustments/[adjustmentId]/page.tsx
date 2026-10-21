import { LedgerAdjustmentDetailScreen } from "@/features/platform/finance/FinanceDetailScreens";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ adjustmentId: string }> }) {
  return <LedgerAdjustmentDetailScreen adjustmentId={(await params).adjustmentId} />;
}
