import { RecoveryScreen } from "@/features/platform/recovery/RecoveryScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <RecoveryScreen searchParams={searchParams} />; }
