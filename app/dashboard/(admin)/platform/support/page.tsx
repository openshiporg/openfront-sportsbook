import { SupportScreen } from '@/features/platform/support/SupportScreen'
export const dynamic = 'force-dynamic'
export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }){return <SupportScreen searchParams={searchParams} />}
