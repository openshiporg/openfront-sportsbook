import { ReconciliationItemDetailScreen } from "@/features/platform/finance/FinanceDetailScreens";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ itemId: string }> }) {
  return <ReconciliationItemDetailScreen itemId={(await params).itemId} />;
}
