import { InboxScreen } from "@/features/platform/integrations/InboxScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <InboxScreen searchParams={searchParams} />; }
