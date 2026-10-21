import { list as keystoneList } from '@keystone-6/core'
import { denyAll } from '@keystone-6/core/access'
import { json, relationship, select, text, timestamp } from '@keystone-6/core/fields'
import { trackingFields } from './trackingFields'
const list=(config:any)=>keystoneList({...config,ui:{hideNavigation:true,hideCreate:true,hideDelete:true,...config.ui},graphql:{...config.graphql,maxTake:100}})

const internalAccess = {
  operation: {
    query: denyAll,
    create: denyAll,
    update: denyAll,
    delete: denyAll,
  },
}

const requiredText = (isIndexed?: 'unique') => text({
  validation: { isRequired: true },
  ...(isIndexed ? { isIndexed } : {}),
})

const internalList = (fields: Record<string, any>, graphql: Record<string, unknown> = {}) => list({
  access: internalAccess,
  graphql: { omit: true, ...graphql },
  ui: { hideNavigation: true, hideCreate: true, hideDelete: true },
  fields: {
    ...fields,
    ...trackingFields,
  },
})

/** Opaque, revocable storefront identity. Only a digest of the bearer cookie is stored. */
export const CustomerSession = internalList({
  tenant: relationship({ ref: 'Tenant' }),
  player: relationship({ ref: 'Player' }),
  tokenDigest: requiredText('unique'),
  expiresAt: timestamp({ validation: { isRequired: true } }),
  assuranceLevel: select({ type: 'enum', options: ['GUEST', 'PASSWORD', 'MFA'].map(value => ({ label: value, value })), defaultValue: 'GUEST' }),
  deviceDigest: text(),
  lastSeenAt: timestamp(),
  revokedAt: timestamp(),
})

/** Durable command claim used to make customer retries safe across processes. */
export const CustomerCommand = internalList({
  tenant: relationship({ ref: 'Tenant' }),
  player: relationship({ ref: 'Player' }),
  commandKey: requiredText('unique'),
  idempotencyKey: requiredText(),
  type: select({
    type: 'enum',
    options: ['WAGER', 'FUND', 'LIMIT', 'EXCLUSION', 'AUTH', 'CASH_OUT', 'PROMOTION', 'DISPUTE', 'PROFILE', 'PRIVACY'].map(value => ({ label: value, value })),
    defaultValue: 'WAGER',
  }),
  requestHash: requiredText(),
  status: select({
    type: 'enum',
    options: ['IN_PROGRESS', 'SUCCEEDED', 'REJECTED'].map(value => ({ label: value, value })),
    defaultValue: 'IN_PROGRESS',
  }),
  result: json(),
})

/** Immutable customer-facing terms snapshot. Wagers link back through their quote. */
export const CustomerQuoteTerms = internalList({
  tenant: relationship({ ref: 'Tenant' }),
  player: relationship({ ref: 'Player' }),
  quote: relationship({ ref: 'Quote' }),
  quoteKey: requiredText('unique'),
  structure: select({ type: 'enum', options: ['STRAIGHT', 'PARLAY', 'SYSTEM', 'ROUND_ROBIN', 'TEASER', 'EACH_WAY'].map(value => ({ label: value, value })), defaultValue: 'STRAIGHT' }),
  legCount: text({ validation: { isRequired: true }, defaultValue: '1' }),
  partCount: text({ validation: { isRequired: true }, defaultValue: '1' }),
  partPlan: json(),
  priceChangeConsent: text({ defaultValue: 'EXACT' }),
  liveDelayMs: text({ defaultValue: '0' }),
  bonusEconomics: json(),
  eventId: requiredText(),
  marketId: requiredText(),
  selectionId: requiredText(),
  priceSnapshotId: requiredText(),
  eventName: requiredText(),
  marketName: requiredText(),
  selectionName: requiredText(),
  decimalOdds: requiredText(),
  stakeMinor: requiredText(),
  potentialReturnMinor: requiredText(),
  currency: requiredText(),
  termsHash: requiredText(),
  expiresAt: timestamp({ validation: { isRequired: true } }),
}, { plural: 'CustomerQuoteTermRecords' })

/** Immutable ordered legs for straight and combination customer quotes. */
export const CustomerQuoteLegTerms = internalList({
  tenant: relationship({ ref: 'Tenant' }),
  player: relationship({ ref: 'Player' }),
  quote: relationship({ ref: 'Quote' }),
  quoteKey: requiredText(),
  legIndex: text({ validation: { isRequired: true } }),
  eventId: requiredText(),
  marketId: requiredText(),
  selectionId: requiredText(),
  priceSnapshotId: requiredText(),
  eventName: requiredText(),
  marketName: requiredText(),
  selectionName: requiredText(),
  decimalOdds: requiredText(),
  line: text(),
  live: select({ type: 'enum', options: ['PREMATCH', 'LIVE'].map(value => ({ label: value, value })), defaultValue: 'PREMATCH' }),
  correlationGroupKey: text(),
  ruleVersion: requiredText(),
  evidenceHash: requiredText(),
}, { plural: 'CustomerQuoteLegTermRecords' })
