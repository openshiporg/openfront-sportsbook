'use client'

import { CustomerShell } from './CustomerShell'
import { PageTitle, PillLink, Track } from './kit'

export function StorefrontNotFound() {
  return <CustomerShell>
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16">
      <PageTitle title="Not found" tone="off" meta="Nothing published at this address" />
      <div className="mt-6"><Track><PillLink href="/" variant="primary">All sports</PillLink></Track></div>
    </div>
  </CustomerShell>
}
