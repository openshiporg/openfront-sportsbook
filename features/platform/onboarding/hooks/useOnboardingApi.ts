'use client'

import seed from '../lib/seed.json'

export type SportsbookOnboardingInput = typeof seed.operator

type OnboardingResponse = { data?: { applySportsbookOnboarding?: { fixtureHash: string; version: string } }; errors?: Array<{ message?: string }> }

const mutation = `mutation Apply($slug:String!,$operatorName:String!,$brandName:String!,$domain:String!,$currency:String!,$currencyExponent:Int!,$jurisdictionCode:String!,$timezone:String!){applySportsbookOnboarding(slug:$slug,operatorName:$operatorName,brandName:$brandName,domain:$domain,currency:$currency,currencyExponent:$currencyExponent,jurisdictionCode:$jurisdictionCode,timezone:$timezone){fixtureHash version}}`

/**
 * Canonical onboarding boundary for the client. The ordered seed is submitted
 * once; the lifecycle resolver creates each dependency transactionally and
 * persists per-stage OnboardingProgress evidence for resume and audit views.
 */
export function useOnboardingApi() {
  async function run(input: SportsbookOnboardingInput) {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: mutation, variables: input }),
    })
    const payload = await response.json() as OnboardingResponse
    if (!response.ok || payload.errors || !payload.data?.applySportsbookOnboarding) {
      throw new Error(payload.errors?.[0]?.message || `Request failed (${response.status})`)
    }
    return payload.data.applySportsbookOnboarding
  }

  return {
    seed: seed.operator,
    dependencyOrder: seed.dependencyOrder,
    externalGates: seed.externalGates,
    run,
  }
}
