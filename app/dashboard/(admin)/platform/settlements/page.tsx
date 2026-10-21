import { SettlementsScreen } from "@/features/platform/settlements/SettlementsScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <SettlementsScreen searchParams={searchParams} />; }
