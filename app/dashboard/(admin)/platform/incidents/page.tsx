import { IncidentsScreen } from "@/features/platform/incidents/IncidentsScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <IncidentsScreen searchParams={searchParams} />; }
