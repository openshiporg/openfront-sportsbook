import { ResponsibleGamingScreen } from "@/features/platform/responsible-gaming/ResponsibleGamingScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <ResponsibleGamingScreen searchParams={searchParams} />; }
