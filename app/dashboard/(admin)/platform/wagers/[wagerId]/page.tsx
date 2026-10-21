import { WagerDetailScreen } from "@/features/platform/wagers/WagerDetailScreen";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ wagerId: string }> }) {
  return <WagerDetailScreen wagerId={(await params).wagerId} />;
}
