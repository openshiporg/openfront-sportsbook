import { OperatorSecurityScreen } from '@/features/platform/security/OperatorSecurityScreen'
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const from = (await searchParams).from
  return <OperatorSecurityScreen returnTo={typeof from === 'string' ? from : undefined} />
}
