import { WagersScreen } from "@/features/platform/wagers/WagersScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <WagersScreen searchParams={searchParams} />; }
