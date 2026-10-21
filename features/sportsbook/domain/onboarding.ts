import { evidenceHash } from './engine'

export interface OnboardingInput { slug:string; operatorName:string; brandName:string; domain:string; currency:string; currencyExponent:number; jurisdictionCode:string; timezone:string }
export function buildOnboardingFixture(input:OnboardingInput){
  if(!/^[a-z0-9-]+$/.test(input.slug)||!/^[A-Z]{3}$/.test(input.currency)||input.currencyExponent<0||input.currencyExponent>6) throw new Error('INVALID_ONBOARDING_INPUT')
  const seed=`sportsbook:${input.slug}:v1`
  const id=(kind:string)=>`${kind}_${evidenceHash(`${seed}:${kind}`).slice(0,20)}`
  return { version:'1', fixtureHash:evidenceHash(input), tenant:{id:id('tenant'),name:input.operatorName,slug:input.slug,status:'ACTIVE',defaultTimezone:input.timezone}, brand:{id:id('brand'),name:input.brandName,domain:input.domain,defaultLocale:'en',status:'ACTIVE'}, jurisdiction:{id:id('jurisdiction'),code:input.jurisdictionCode,status:'PENDING'}, currency:{code:input.currency,exponent:input.currencyExponent}, providers:['sports','results','kyc','aml','geo','payments','messaging','analytics','tax','reporting','integrity','affiliates','pam'].map(kind=>({id:id(`provider-${kind}`),kind,adapterId:`sandbox-${kind}`,certificationStatus:'SANDBOX'})), starterCatalog:{sport:{id:id('sport'),key:'football',name:'Football'},competition:{id:id('competition'),key:'sandbox-league',name:'Sandbox League'}}, externalGates:['licence approval','jurisdiction policy approval','provider certification','finance chart approval'] }
}

export type PromotionOnboardingProgress = { status: string | null; evidenceHash: string }

export function prepareSandboxPromotionProgress(progress: PromotionOnboardingProgress | null, fixtureHash: string) {
  const completeEvidenceHash = evidenceHash({ fixtureHash, stage: 'PROMOTIONS' })
  const pendingEvidenceHash = evidenceHash({ fixtureHash, stage: 'PROMOTIONS', provisioning: 'PENDING' })
  if (!progress) return { kind: 'CREATE' as const, evidenceHash: pendingEvidenceHash }
  if (progress.status === 'PENDING' && progress.evidenceHash === pendingEvidenceHash) return { kind: 'KEEP_PENDING' as const }
  if (progress.status === 'COMPLETE' && progress.evidenceHash === completeEvidenceHash) {
    return { kind: 'RESET_PENDING' as const, previousEvidenceHash: completeEvidenceHash, evidenceHash: pendingEvidenceHash }
  }
  throw new Error('ONBOARDING_PROMOTIONS_PROGRESS_CONFLICT')
}

export async function ensurePromotionsThenComplete(ensurePromotions: () => Promise<void>, completeProgress: () => Promise<void>) {
  await ensurePromotions()
  await completeProgress()
}
