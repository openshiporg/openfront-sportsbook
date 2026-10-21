import { CustomerDetailScreen } from "@/features/platform/customers/CustomerDetailScreen";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ playerId: string }> }) {
  return <CustomerDetailScreen playerId={(await params).playerId} />;
}
