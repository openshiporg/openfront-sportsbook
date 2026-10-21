import { SettlementDetailScreen } from "@/features/platform/settlements/SettlementDetailScreen";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ wagerId: string }> }) {
  return <SettlementDetailScreen wagerId={(await params).wagerId} />;
}
