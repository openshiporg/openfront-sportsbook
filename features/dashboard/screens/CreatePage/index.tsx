/**
 * CreatePage for Dashboard 2
 * Server component following Dashboard 1's pattern
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CreatePageClient } from './CreatePageClient'
import { getListByPath } from '../../actions/getListByPath'
import { PageBreadcrumbs } from '../../components/PageBreadcrumbs'
import { basePath } from '../../lib/config'

interface CreatePageParams {
  params: Promise<{
    listKey: string
  }>
}

/**
 * A list whose create access is denied for this session (workflow-owned records, or a permission the
 * session lacks, e.g. operator rights that need a verified MFA session) has no create form. Say so
 * plainly instead of a 404 or an error screen.
 */
function CreateUnavailable({ list }: { list: any }) {
  return (
    <>
      <PageBreadcrumbs
        items={[
          { type: 'link', label: 'Dashboard', href: '/' },
          { type: 'link', label: list.label, href: `/${list.path}` },
          { type: 'page', label: 'Create' },
        ]}
      />
      <div className="w-full max-w-2xl p-4 md:p-6">
        <h1 className="text-lg font-semibold md:text-2xl">Creating {list.label.toLowerCase()} is not available here</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {list.label} are created by the sportsbook&apos;s own workflows, or need a permission this session
          doesn&apos;t have. If you manage {list.label.toLowerCase()}, verify MFA in Operator security first.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`${basePath}/${list.path}`}
            className="inline-flex min-h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted/50"
          >
            Back to {list.label}
          </Link>
          <Link
            href={`${basePath}/platform/security`}
            className="inline-flex min-h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted/50"
          >
            Operator security
          </Link>
        </div>
      </div>
    </>
  )
}

export async function CreatePage({ params }: CreatePageParams) {
  const resolvedParams = await params
  const { listKey } = resolvedParams

  const list = await getListByPath(listKey)

  if (!list) {
    notFound()
  }

  if (list.hideCreate) {
    return <CreateUnavailable list={list} />
  }

  return <CreatePageClient listKey={listKey} list={list} />
}

export default CreatePage
