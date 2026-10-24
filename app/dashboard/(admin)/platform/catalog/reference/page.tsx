import { ReferenceScreen } from "@/features/platform/catalog/reference/ReferenceScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <ReferenceScreen searchParams={searchParams} />; }
