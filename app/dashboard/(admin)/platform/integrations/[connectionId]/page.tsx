import { IntegrationDetailScreen } from "@/features/platform/integrations/IntegrationDetailScreen";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ connectionId: string }> }) {
  return <IntegrationDetailScreen connectionId={(await params).connectionId} />;
}
