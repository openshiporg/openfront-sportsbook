import { DeadLetterScreen } from "@/features/platform/integrations/DeadLetterScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <DeadLetterScreen searchParams={searchParams} />; }
