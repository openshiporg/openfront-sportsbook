import { RolesScreen } from "@/features/platform/roles/RolesScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <RolesScreen searchParams={searchParams} />; }
