import { ReconciliationRunDetailScreen } from "@/features/platform/finance/FinanceDetailScreens";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ runId: string }> }) {
  return <ReconciliationRunDetailScreen runId={(await params).runId} />;
}
