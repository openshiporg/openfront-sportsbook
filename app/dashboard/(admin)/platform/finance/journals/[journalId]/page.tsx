import { JournalDetailScreen } from "@/features/platform/finance/FinanceDetailScreens";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ journalId: string }> }) {
  return <JournalDetailScreen journalId={(await params).journalId} />;
}
