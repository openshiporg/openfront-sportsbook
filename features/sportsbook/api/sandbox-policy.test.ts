import assert from 'node:assert/strict'
import { test } from 'node:test'
import { assertOperatorReady } from './sandbox-policy'

function prisma(licence: any, payments = true, policy = true) {
  return {
    operatorLicence: { findMany: async () => licence ? [licence] : [] },
    providerConnection: { findFirst: async () => payments ? { id: 'provider' } : null },
    jurisdictionPolicyVersion: { findFirst: async () => policy ? { id: 'policy' } : null },
  }
}
const licence = { status: 'ACTIVE', expiresAt: new Date(Date.now() + 86_400_000), licenceNumber: 'scratch-only', regulator: 'scratch-only', permittedRegions: ['US-NJ'] }
test('operator readiness requires active licence, payment installation and responsible gaming policy', async () => {
  const prior = process.env.GEO_DEV_REGION
  process.env.GEO_DEV_REGION = 'US-NJ'
  try {
    await assertOperatorReady(prisma(licence), 'tenant')
    await assert.rejects(assertOperatorReady(prisma(null), 'tenant'), /OPERATOR_NOT_LICENSED/)
    await assert.rejects(assertOperatorReady(prisma(licence, false), 'tenant'), /PAYMENTS_NOT_CONFIGURED/)
    await assert.rejects(assertOperatorReady(prisma(licence, true, false), 'tenant'), /RESPONSIBLE_GAMING_NOT_CONFIGURED/)
    delete process.env.GEO_DEV_REGION
    await assertOperatorReady(prisma(licence), 'tenant')
    await assert.rejects(assertOperatorReady(prisma(licence), 'tenant', new Request('https://x.test', { headers: { 'x-geo-region': 'US-PA' } })), /GEO_BLOCKED/)
  } finally { if (prior === undefined) delete process.env.GEO_DEV_REGION; else process.env.GEO_DEV_REGION = prior }
})
