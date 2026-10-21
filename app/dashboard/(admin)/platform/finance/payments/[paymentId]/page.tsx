import { PaymentDetailScreen } from "@/features/platform/finance/FinanceDetailScreens";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ paymentId: string }> }) {
  return <PaymentDetailScreen paymentId={(await params).paymentId} />;
}
