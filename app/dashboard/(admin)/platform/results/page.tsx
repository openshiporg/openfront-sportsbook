import { ResultsScreen } from "@/features/platform/results/ResultsScreen";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { eventId } = await searchParams;
  return <ResultsScreen eventId={typeof eventId === "string" ? eventId : undefined} searchParams={searchParams} />;
}
