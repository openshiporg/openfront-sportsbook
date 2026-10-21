import { evidenceHash } from './engine'

export type WagerStructure = 'STRAIGHT' | 'PARLAY' | 'SYSTEM' | 'ROUND_ROBIN' | 'TEASER' | 'EACH_WAY'
export type CombinationGrade = 'WIN' | 'LOSS' | 'PUSH' | 'VOID' | 'DEAD_HEAT'
export type CombinationLeg = { id: string; decimalOdds: string; line?: string; correlationGroupKey?: string; live?: boolean }
export type CombinationPart = { index: number; key: string; legIndexes: number[]; stakeMinor: bigint; decimalOdds: string; potentialReturnMinor: bigint }

type Rational = { numerator: bigint; denominator: bigint }

function gcd(a: bigint, b: bigint): bigint { while (b) [a, b] = [b, a % b]; return a < 0n ? -a : a }
function rational(numerator: bigint, denominator: bigint): Rational {
  if (denominator <= 0n) throw new Error('INVALID_DENOMINATOR')
  const divisor = gcd(numerator, denominator)
  return { numerator: numerator / divisor, denominator: denominator / divisor }
}
function multiply(a: Rational, b: Rational) { return rational(a.numerator * b.numerator, a.denominator * b.denominator) }
function add(a: Rational, b: Rational) { return rational(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator) }
function subtract(a: Rational, b: Rational) { return add(a, rational(-b.numerator, b.denominator)) }
export function parseExactDecimal(value: string): Rational {
  if (!/^\d+(\.\d{1,9})?$/.test(value)) throw new Error('INVALID_ODDS')
  const [whole, fraction = ''] = value.split('.')
  const denominator = 10n ** BigInt(fraction.length)
  const result = rational(BigInt(whole) * denominator + BigInt(fraction || '0'), denominator)
  if (result.numerator < result.denominator) throw new Error('ODDS_BELOW_ONE')
  return result
}
export function rationalToDecimal(value: Rational, scale = 6) {
  const factor = 10n ** BigInt(scale)
  const scaled = value.numerator * factor / value.denominator
  const whole = scaled / factor
  const fraction = String(scaled % factor).padStart(scale, '0').replace(/0+$/, '')
  return fraction ? `${whole}.${fraction}` : String(whole)
}
export function multiplyOdds(values: string[]) {
  if (!values.length) throw new Error('NO_LEGS')
  return rationalToDecimal(values.map(parseExactDecimal).reduce(multiply, rational(1n, 1n)))
}
export function exactPotentialReturn(stakeMinor: bigint, decimalOdds: string) {
  const odds = parseExactDecimal(decimalOdds)
  return stakeMinor * odds.numerator / odds.denominator
}

function choose(items: number[], size: number): number[][] {
  if (size < 1 || size > items.length) return []
  const result: number[][] = []
  const visit = (start: number, current: number[]) => {
    if (current.length === size) { result.push([...current]); return }
    for (let index = start; index <= items.length - (size - current.length); index++) { current.push(items[index]); visit(index + 1, current); current.pop() }
  }
  visit(0, [])
  return result
}

export function materializeCombination(input: {
  structure: WagerStructure
  legs: CombinationLeg[]
  stakeMinor: bigint
  systemSize?: number
  teaserPoints?: string
  teaserPrice?: string
  eachWayPlaceFraction?: { numerator: bigint; denominator: bigint }
}): CombinationPart[] {
  if (input.stakeMinor <= 0n || input.legs.length < 1 || input.legs.length > 12) throw new Error('INVALID_COMBINATION')
  const indexes = input.legs.map((_, index) => index)
  let combinations: number[][]
  switch (input.structure) {
    case 'STRAIGHT': if (input.legs.length !== 1) throw new Error('STRAIGHT_REQUIRES_ONE_LEG'); combinations = [[0]]; break
    case 'PARLAY': if (input.legs.length < 2) throw new Error('PARLAY_REQUIRES_TWO_LEGS'); combinations = [indexes]; break
    case 'SYSTEM': {
      const size = input.systemSize ?? Math.max(2, input.legs.length - 1)
      combinations = choose(indexes, size)
      if (combinations.length < 2) throw new Error('SYSTEM_REQUIRES_MULTIPLE_PARTS')
      break
    }
    case 'ROUND_ROBIN': {
      const size = input.systemSize ?? 2
      combinations = choose(indexes, size)
      if (combinations.length < 2) throw new Error('ROUND_ROBIN_REQUIRES_MULTIPLE_PARTS')
      break
    }
    case 'TEASER':
      if (input.legs.length < 2 || !input.teaserPoints || !input.teaserPrice || input.legs.some(leg => !leg.line)) throw new Error('TEASER_RULE_UNAVAILABLE')
      combinations = [indexes]
      break
    case 'EACH_WAY':
      if (input.legs.length !== 1) throw new Error('EACH_WAY_REQUIRES_ONE_LEG')
      combinations = [[0], [0]]
      break
  }
  if (combinations.length > 120) throw new Error('TOO_MANY_PARTS')
  const baseStake = input.stakeMinor / BigInt(combinations.length)
  const remainder = input.stakeMinor % BigInt(combinations.length)
  return combinations.map((legIndexes, index) => {
    const stakeMinor = baseStake + (BigInt(index) < remainder ? 1n : 0n)
    let decimalOdds: string
    let key = `${input.structure}:${legIndexes.join('-')}`
    if (input.structure === 'TEASER') decimalOdds = input.teaserPrice!
    else if (input.structure === 'EACH_WAY' && index === 1) {
      const fraction = input.eachWayPlaceFraction ?? { numerator: 1n, denominator: 4n }
      const winOdds = parseExactDecimal(input.legs[0].decimalOdds)
      const profit = multiply(subtract(winOdds, rational(1n, 1n)), rational(fraction.numerator, fraction.denominator))
      decimalOdds = rationalToDecimal(add(rational(1n, 1n), profit))
      key = 'EACH_WAY:PLACE'
    } else {
      decimalOdds = multiplyOdds(legIndexes.map(legIndex => input.legs[legIndex].decimalOdds))
      if (input.structure === 'EACH_WAY') key = 'EACH_WAY:WIN'
    }
    return { index, key, legIndexes, stakeMinor, decimalOdds, potentialReturnMinor: exactPotentialReturn(stakeMinor, decimalOdds) }
  })
}

export function combinationGradeMultiplier(decimalOdds: string, outcome: CombinationGrade, factorNumerator = 1n, factorDenominator = 2n): Rational {
  const odds = parseExactDecimal(decimalOdds)
  if (outcome === 'LOSS') return rational(0n, 1n)
  if (outcome === 'PUSH' || outcome === 'VOID') return rational(1n, 1n)
  if (outcome === 'WIN') return odds
  if (factorNumerator < 0n || factorDenominator <= 0n || factorNumerator > factorDenominator) throw new Error('INVALID_DEAD_HEAT_FACTOR')
  return add(rational(1n, 1n), multiply(subtract(odds, rational(1n, 1n)), rational(factorNumerator, factorDenominator)))
}

export function settleCombinationPart(input: {
  stakeMinor: bigint
  legs: Array<{ decimalOdds: string; outcome: CombinationGrade; factorNumerator?: bigint; factorDenominator?: bigint }>
  stakeReturned?: boolean
  acceptedPotentialReturnMinor?: bigint
}) {
  const multiplier = input.legs.reduce((current, leg) => multiply(current, combinationGradeMultiplier(leg.decimalOdds, leg.outcome, leg.factorNumerator, leg.factorDenominator)), rational(1n, 1n))
  const allWin = input.legs.length > 0 && input.legs.every(leg => leg.outcome === 'WIN')
  const gross = allWin && input.acceptedPotentialReturnMinor !== undefined
    ? input.acceptedPotentialReturnMinor
    : input.stakeMinor * multiplier.numerator / multiplier.denominator
  const payoutMinor = input.stakeReturned === false ? (gross > input.stakeMinor ? gross - input.stakeMinor : 0n) : gross
  return { payoutMinor, multiplier: rationalToDecimal(multiplier), inputHash: evidenceHash({ stakeMinor: input.stakeMinor, legs: input.legs, stakeReturned: input.stakeReturned ?? true }) }
}

export function validateCombinationCorrelation(legs: Array<{ eventId: string; marketId: string; correlationGroupKey?: string }>, allowedPairs: Set<string>) {
  for (let left = 0; left < legs.length; left++) for (let right = left + 1; right < legs.length; right++) {
    const a = legs[left], b = legs[right]
    if (a.eventId !== b.eventId) continue
    const key = [a.marketId, b.marketId].sort().join(':')
    if (!allowedPairs.has(key)) throw new Error('CORRELATED_SELECTIONS_DENIED')
  }
}

export function fullCombinationEvidence(parts: CombinationPart[], legs: CombinationLeg[]) {
  return evidenceHash({ parts: parts.map(part => ({ ...part, stakeMinor: String(part.stakeMinor), potentialReturnMinor: String(part.potentialReturnMinor) })), legs })
}
