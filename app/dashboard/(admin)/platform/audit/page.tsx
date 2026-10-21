import { AuditScreen } from "@/features/platform/audit/AuditScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <AuditScreen searchParams={searchParams} />; }
