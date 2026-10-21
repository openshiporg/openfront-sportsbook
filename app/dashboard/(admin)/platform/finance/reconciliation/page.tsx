import { ReconciliationScreen } from '@/features/platform/finance/ReconciliationScreen'
export const dynamic = 'force-dynamic'
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }){return <ReconciliationScreen searchParams={searchParams} />}
