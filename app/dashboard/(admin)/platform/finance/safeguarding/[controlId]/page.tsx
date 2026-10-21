import { SafeguardingControlDetailScreen } from "@/features/platform/finance/FinanceDetailScreens";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ controlId: string }> }) {
  return <SafeguardingControlDetailScreen controlId={(await params).controlId} />;
}
