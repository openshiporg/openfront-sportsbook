import { AuditDetailScreen } from "@/features/platform/audit/AuditDetailScreen";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ auditId: string }> }) {
  return <AuditDetailScreen auditId={(await params).auditId} />;
}
