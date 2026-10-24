import { PromotionDetailScreen } from "@/features/platform/promotions/PromotionDetailScreen";
export const dynamic = "force-dynamic";
export default async function Page({ params, searchParams }: { params: Promise<{ promotionId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { promotionId } = await params;
  return <PromotionDetailScreen promotionId={promotionId} searchParams={searchParams} />;
}
