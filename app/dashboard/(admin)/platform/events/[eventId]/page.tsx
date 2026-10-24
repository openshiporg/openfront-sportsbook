import { CatalogDetailScreen } from "@/features/platform/catalog/CatalogDetailScreen";
export const dynamic = "force-dynamic";
export default async function Page({ params, searchParams }: { params: Promise<{ eventId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CatalogDetailScreen eventId={(await params).eventId} searchParams={searchParams} />;
}
