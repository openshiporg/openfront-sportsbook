import { SupportCaseDetailScreen } from "@/features/platform/support/SupportCaseDetailScreen";
export const dynamic = "force-dynamic";
export default async function Page({ params, searchParams }: { params: Promise<{ caseId: string }>; searchParams: Promise<{ page?: string }> }) {
  const [{ caseId }, query] = await Promise.all([params, searchParams]);
  return <SupportCaseDetailScreen caseId={caseId} page={Number(query.page ?? 1)} />;
}
