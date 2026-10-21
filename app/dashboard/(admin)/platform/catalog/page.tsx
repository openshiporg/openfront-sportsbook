import { CatalogScreen } from "@/features/platform/catalog/CatalogScreen";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <CatalogScreen searchParams={searchParams} />; }
